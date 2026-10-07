const { Exam, Mark, Student, TeachingAssignment } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

async function assertTeacherOwnsSubject(req, exam) {
  if (req.user.role !== 'teacher') return null;
  const assignments = await TeachingAssignment.find({
    teacher: req.teacherProfile._id,
    subject: exam.subject,
    course: exam.course,
    semester: exam.semester,
  });
  if (assignments.length === 0) throw ApiError.forbidden('You do not teach this subject');
  return assignments.map((a) => a.section);
}

const getSheet = asyncHandler(async (req, res) => {
  const { exam: examId } = req.query;
  if (!examId) throw ApiError.badRequest('exam is required');

  const exam = await Exam.findById(examId).populate('subject', 'name code');
  if (!exam) throw ApiError.notFound('Exam not found');

  const sections = await assertTeacherOwnsSubject(req, exam);

  const studentFilter = { course: exam.course, semester: exam.semester, academicStatus: 'active' };
  if (sections) studentFilter.section = { $in: sections };

  const students = await Student.find(studentFilter).populate('user', 'name').sort({ rollNumber: 1 });
  const existing = await Mark.find({ exam: examId, student: { $in: students.map((s) => s._id) } });
  const existingMap = new Map(existing.map((m) => [m.student.toString(), m]));

  res.json({
    exam,
    students: students.map((s) => {
      const mark = existingMap.get(s._id.toString());
      return {
        student: s._id,
        studentId: s.studentId,
        rollNumber: s.rollNumber,
        name: s.user?.name,
        obtained: mark?.obtained ?? null,
        isAbsent: mark?.isAbsent ?? false,
      };
    }),
  });
});

const saveSheet = asyncHandler(async (req, res) => {
  const { exam: examId, records } = req.body;
  if (!examId || !Array.isArray(records)) throw ApiError.badRequest('exam and records are required');

  const exam = await Exam.findById(examId);
  if (!exam) throw ApiError.notFound('Exam not found');
  if (exam.isPublished && req.user.role === 'teacher') {
    throw ApiError.forbidden('Cannot edit marks for a published exam');
  }

  await assertTeacherOwnsSubject(req, exam);

  for (const r of records) {
    if (!r.isAbsent && (r.obtained < 0 || r.obtained > exam.maxMarks)) {
      throw ApiError.badRequest(
        `obtained marks for student ${r.student} must be between 0 and ${exam.maxMarks}`
      );
    }
  }

  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, exam: examId },
      update: {
        $set: {
          obtained: r.isAbsent ? 0 : r.obtained,
          isAbsent: !!r.isAbsent,
          enteredBy: req.user._id,
        },
      },
      upsert: true,
    },
  }));

  if (ops.length > 0) await Mark.bulkWrite(ops);
  res.json({ message: 'Marks saved', count: ops.length });
});

module.exports = { getSheet, saveSheet };
