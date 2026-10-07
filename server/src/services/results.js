const { Student, Subject, Exam, Mark, Result } = require('../models');
const { gradeFor } = require('./grading');

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Builds the subject-by-subject snapshot for one student in one course+semester+academicYear.
async function buildSubjectSnapshot(studentId, subjects, exams) {
  const snapshot = [];

  for (const subject of subjects) {
    const subjectExams = exams.filter((e) => e.subject.toString() === subject._id.toString());
    const semesterExam = subjectExams.find((e) => e.type === 'semester');
    const supplementaryExam = subjectExams.find((e) => e.type === 'supplementary');

    const marks = await Mark.find({
      student: studentId,
      exam: { $in: subjectExams.map((e) => e._id) },
    });
    const markByExam = new Map(marks.map((m) => [m.exam.toString(), m]));

    let maxMarks = 0;
    let obtained = 0;

    for (const exam of subjectExams) {
      if (supplementaryExam && semesterExam && exam._id.toString() === semesterExam._id.toString()) {
        const supMark = markByExam.get(supplementaryExam._id.toString());
        if (supMark) continue; // replaced by supplementary below
      }
      if (exam._id.toString() === supplementaryExam?._id.toString()) continue; // added explicitly below

      const mark = markByExam.get(exam._id.toString());
      maxMarks += exam.maxMarks;
      obtained += mark && !mark.isAbsent ? mark.obtained : 0;
    }

    if (supplementaryExam) {
      const supMark = markByExam.get(supplementaryExam._id.toString());
      if (supMark) {
        maxMarks += supplementaryExam.maxMarks;
        obtained += supMark.isAbsent ? 0 : supMark.obtained;
      }
    }

    const percent = maxMarks > 0 ? round2((obtained / maxMarks) * 100) : 0;
    const { grade, gradePoint } = await gradeFor(percent);

    snapshot.push({
      subject: subject._id,
      maxMarks,
      obtained,
      percent,
      grade,
      gradePoint,
      credits: subject.credits,
      status: grade === 'F' ? 'fail' : 'pass',
    });
  }

  return snapshot;
}

async function computeCgpa(studentId, semester, academicYear, currentSubjects) {
  const otherResults = await Result.find({
    student: studentId,
    isPublished: true,
    $nor: [{ semester, academicYear }],
  });

  let totalPoints = 0;
  let totalCredits = 0;

  for (const result of otherResults) {
    for (const s of result.subjects) {
      totalPoints += s.credits * s.gradePoint;
      totalCredits += s.credits;
    }
  }

  for (const s of currentSubjects) {
    totalPoints += s.credits * s.gradePoint;
    totalCredits += s.credits;
  }

  return totalCredits > 0 ? round2(totalPoints / totalCredits) : 0;
}

// Shared by the admin "generate results" flow (students queried live by their current semester)
// and the seed script (which passes an explicit roster, since by seed time students have already
// been advanced past the semester being backfilled).
async function generateResultsForStudents({ students, subjects, exams, course, semester, academicYear }) {
  const results = [];

  for (const student of students) {
    const existing = await Result.findOne({ student: student._id, semester, academicYear });
    if (existing && existing.isPublished) {
      results.push(existing);
      continue;
    }

    const subjectSnapshot = await buildSubjectSnapshot(student._id, subjects, exams);
    const totalMax = subjectSnapshot.reduce((sum, s) => sum + s.maxMarks, 0);
    const totalObtained = subjectSnapshot.reduce((sum, s) => sum + s.obtained, 0);
    const percentage = totalMax > 0 ? round2((totalObtained / totalMax) * 100) : 0;

    const totalCredits = subjectSnapshot.reduce((sum, s) => sum + s.credits, 0);
    const totalPoints = subjectSnapshot.reduce((sum, s) => sum + s.credits * s.gradePoint, 0);
    const sgpa = totalCredits > 0 ? round2(totalPoints / totalCredits) : 0;

    const backlogs = subjectSnapshot.filter((s) => s.status === 'fail').length;
    const status = backlogs === 0 ? 'pass' : 'fail';
    const cgpa = await computeCgpa(student._id, semester, academicYear, subjectSnapshot);

    const payload = {
      student: student._id,
      course,
      semester,
      academicYear,
      subjects: subjectSnapshot,
      totalMax,
      totalObtained,
      percentage,
      sgpa,
      cgpa,
      status,
      backlogs,
    };

    const result = await Result.findOneAndUpdate(
      { student: student._id, semester, academicYear },
      payload,
      { upsert: true, new: true }
    );
    results.push(result);
  }

  return results;
}

async function generateResultsForClass({ course, semester, academicYear }) {
  const students = await Student.find({ course, semester, academicStatus: 'active' });
  const subjects = await Subject.find({ course, semester });
  const exams = await Exam.find({ course, semester, academicYear });
  return generateResultsForStudents({ students, subjects, exams, course, semester, academicYear });
}

module.exports = { generateResultsForClass, generateResultsForStudents };
