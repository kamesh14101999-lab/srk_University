const { Student, Result, Exam, Mark } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { computePercent, computePercentForStudents } = require('../services/attendanceStats');
const { getTeacherAssignments } = require('../services/scope');

function round2(n) {
  return Math.round(n * 100) / 100;
}

const admin = asyncHandler(async (req, res) => {
  const results = await Result.find({ isPublished: true })
    .populate({ path: 'course', select: 'name department', populate: { path: 'department', select: 'name' } })
    .populate('student', 'studentId department');

  const universityAverage = results.length
    ? round2(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 0;

  const passCount = results.filter((r) => r.status === 'pass').length;
  const passPercent = results.length ? round2((passCount / results.length) * 100) : 0;

  const byCourse = new Map();
  const byDepartment = new Map();
  const bySemester = new Map();
  const gradeDistribution = new Map();

  for (const r of results) {
    const courseName = r.course?.name || 'Unknown';
    if (!byCourse.has(courseName)) byCourse.set(courseName, { sum: 0, count: 0 });
    const c = byCourse.get(courseName);
    c.sum += r.percentage;
    c.count += 1;

    const deptName = r.course?.department?.name || 'Unknown';
    if (!byDepartment.has(deptName)) byDepartment.set(deptName, { sum: 0, count: 0 });
    const d = byDepartment.get(deptName);
    d.sum += r.percentage;
    d.count += 1;

    if (!bySemester.has(r.semester)) bySemester.set(r.semester, { sum: 0, count: 0 });
    const s = bySemester.get(r.semester);
    s.sum += r.percentage;
    s.count += 1;

    for (const sub of r.subjects) {
      gradeDistribution.set(sub.grade, (gradeDistribution.get(sub.grade) || 0) + 1);
    }
  }

  const topPerformers = [...results].sort((a, b) => b.percentage - a.percentage).slice(0, 10);

  const studentsNeedingAttention = [];
  for (const r of results) {
    if (r.percentage < 40) {
      studentsNeedingAttention.push({ student: r.student, percentage: r.percentage, reason: 'low_marks' });
    }
  }
  const activeStudents = await Student.find({ academicStatus: 'active' }).select('_id studentId').limit(300);
  const percentMap = await computePercentForStudents(activeStudents.map((s) => s._id));
  const attendanceVsPerformance = [];
  for (const s of activeStudents) {
    const percent = percentMap.get(s._id.toString())?.percent ?? 0;
    const result = results.find((r) => r.student?._id?.toString() === s._id.toString());
    if (percent < 65) {
      studentsNeedingAttention.push({ student: s, percentage: percent, reason: 'low_attendance' });
    }
    if (result) {
      attendanceVsPerformance.push({ student: s.studentId, attendance: percent, performance: result.percentage });
    }
  }

  res.json({
    universityAverage,
    passPercent,
    departmentPerformance: Array.from(byDepartment.entries()).map(([department, { sum, count }]) => ({
      department,
      average: round2(sum / count),
    })),
    coursePerformance: Array.from(byCourse.entries()).map(([course, { sum, count }]) => ({
      course,
      average: round2(sum / count),
    })),
    semesterPerformance: Array.from(bySemester.entries()).map(([semester, { sum, count }]) => ({
      semester,
      average: round2(sum / count),
    })),
    gradeDistribution: Array.from(gradeDistribution.entries()).map(([grade, count]) => ({ grade, count })),
    topPerformers,
    studentsNeedingAttention: studentsNeedingAttention.slice(0, 20),
    attendanceVsPerformance,
  });
});

const teacherAnalytics = asyncHandler(async (req, res) => {
  const assignments = await getTeacherAssignments(req.teacherProfile._id);
  if (assignments.length === 0) return res.json([]);

  // Batch-fetch every exam for every assignment, and the per-exam average/count, in two queries
  // total instead of two queries per exam.
  const subjectIds = assignments.map((a) => a.subject);
  const allExams = await Exam.find({ subject: { $in: subjectIds } }).sort({ date: 1 });
  const markStats = await Mark.aggregate([
    { $match: { exam: { $in: allExams.map((e) => e._id) } } },
    { $group: { _id: '$exam', avg: { $avg: { $cond: ['$isAbsent', 0, '$obtained'] } } } },
  ]);
  const markStatsByExam = new Map(markStats.map((m) => [m._id.toString(), m.avg]));

  // Batch-fetch every student across every assignment's (course, semester, section) in one query.
  const allStudents = await Student.find({
    $or: assignments.map((a) => ({ course: a.course, semester: a.semester, section: a.section })),
  })
    .select('studentId user course semester section')
    .populate('user', 'name');

  // Batch-fetch marks for each assignment's latest exam in one query, keyed by exam id.
  const latestExamByAssignment = new Map();
  for (const assignment of assignments) {
    const exams = allExams.filter(
      (e) =>
        e.subject.toString() === assignment.subject.toString() &&
        e.course.toString() === assignment.course.toString() &&
        e.semester === assignment.semester
    );
    if (exams.length > 0) latestExamByAssignment.set(assignment._id.toString(), exams[exams.length - 1]);
  }
  const latestExamIds = Array.from(latestExamByAssignment.values()).map((e) => e._id);
  const latestExamMarks = await Mark.find({ exam: { $in: latestExamIds } }).populate({
    path: 'student',
    select: 'studentId user',
    populate: { path: 'user', select: 'name' },
  });
  const marksByExam = new Map();
  for (const mark of latestExamMarks) {
    const key = mark.exam.toString();
    if (!marksByExam.has(key)) marksByExam.set(key, []);
    marksByExam.get(key).push(mark);
  }

  const report = [];

  for (const assignment of assignments) {
    const exams = allExams.filter(
      (e) =>
        e.subject.toString() === assignment.subject.toString() &&
        e.course.toString() === assignment.course.toString() &&
        e.semester === assignment.semester
    );
    const students = allStudents.filter(
      (s) =>
        s.course.toString() === assignment.course.toString() &&
        s.semester === assignment.semester &&
        s.section === assignment.section
    );

    const examTrend = exams.map((exam) => ({
      exam: exam.name,
      average: round2(markStatsByExam.get(exam._id.toString()) ?? 0),
      maxMarks: exam.maxMarks,
    }));

    const latestExam = latestExamByAssignment.get(assignment._id.toString());
    let topPerformers = [];
    let lowScorers = [];
    if (latestExam) {
      const marks = marksByExam.get(latestExam._id.toString()) || [];
      const sorted = [...marks].sort((a, b) => b.obtained - a.obtained);
      topPerformers = sorted.slice(0, 5);
      lowScorers = sorted.slice(-5).reverse();
    }

    report.push({
      assignment: {
        id: assignment._id,
        subject: assignment.subject,
        course: assignment.course,
        semester: assignment.semester,
        section: assignment.section,
      },
      classAverage: examTrend.length
        ? round2(examTrend.reduce((sum, e) => sum + e.average, 0) / examTrend.length)
        : 0,
      examTrend,
      topPerformers,
      lowScorers,
      studentCount: students.length,
    });
  }

  res.json(report);
});

const studentAnalytics = asyncHandler(async (req, res) => {
  const sp = req.studentProfile;

  const marks = await Mark.find({ student: sp._id }).populate({
    path: 'exam',
    select: 'name subject maxMarks date isPublished',
    populate: { path: 'subject', select: 'name' },
  });
  const publishedMarks = marks.filter((m) => m.exam?.isPublished);

  const marksTrend = publishedMarks
    .sort((a, b) => new Date(a.exam.date) - new Date(b.exam.date))
    .map((m) => ({
      exam: m.exam.name,
      subject: m.exam.subject?.name,
      obtained: m.obtained,
      maxMarks: m.exam.maxMarks,
      percent: round2((m.obtained / m.exam.maxMarks) * 100),
    }));

  const results = await Result.find({ student: sp._id, isPublished: true }).sort({ semester: 1 });
  const semesterComparison = results.map((r) => ({
    semester: r.semester,
    sgpa: r.sgpa,
    percentage: r.percentage,
  }));

  const subjectMap = new Map();
  for (const m of marksTrend) {
    if (!subjectMap.has(m.subject)) subjectMap.set(m.subject, { sum: 0, count: 0 });
    const s = subjectMap.get(m.subject);
    s.sum += m.percent;
    s.count += 1;
  }
  const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, { sum, count }]) => ({
    subject,
    average: round2(sum / count),
  }));

  const { percent: attendancePercent } = await computePercent({ student: sp._id });

  res.json({
    marksTrend,
    semesterComparison,
    subjectPerformance,
    attendanceVsMarks: {
      attendance: attendancePercent,
      averageMarks: subjectPerformance.length
        ? round2(subjectPerformance.reduce((s, x) => s + x.average, 0) / subjectPerformance.length)
        : 0,
    },
  });
});

module.exports = { admin, teacherAnalytics, studentAnalytics };
