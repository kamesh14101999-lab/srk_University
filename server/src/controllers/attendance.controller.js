const { Attendance, Student, TeachingAssignment, Setting } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { computePercent, round1 } = require('../services/attendanceStats');

async function loadAssignmentForTeacher(assignmentId, req) {
  const assignment = await TeachingAssignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Teaching assignment not found');
  if (req.user.role === 'teacher') {
    if (!req.teacherProfile || assignment.teacher.toString() !== req.teacherProfile._id.toString()) {
      throw ApiError.forbidden('You do not own this teaching assignment');
    }
  }
  return assignment;
}

const getSheet = asyncHandler(async (req, res) => {
  const { assignment: assignmentId, date } = req.query;
  if (!assignmentId || !date) throw ApiError.badRequest('assignment and date are required');

  const assignment = await loadAssignmentForTeacher(assignmentId, req);

  const students = await Student.find({
    course: assignment.course,
    semester: assignment.semester,
    section: assignment.section,
    academicStatus: 'active',
  })
    .populate('user', 'name')
    .sort({ rollNumber: 1 });

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await Attendance.find({
    subject: assignment.subject,
    student: { $in: students.map((s) => s._id) },
    date: { $gte: dayStart, $lte: dayEnd },
  });
  const existingMap = new Map(existing.map((e) => [e.student.toString(), e.status]));

  res.json({
    assignment,
    students: students.map((s) => ({
      student: s._id,
      studentId: s.studentId,
      rollNumber: s.rollNumber,
      name: s.user?.name,
      status: existingMap.get(s._id.toString()) || 'present',
    })),
  });
});

const saveSheet = asyncHandler(async (req, res) => {
  const { assignment: assignmentId, date, records } = req.body;
  if (!assignmentId || !date || !Array.isArray(records)) {
    throw ApiError.badRequest('assignment, date, and records are required');
  }

  const parsedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (parsedDate > today) throw ApiError.badRequest('Attendance date cannot be in the future');

  const assignment = await loadAssignmentForTeacher(assignmentId, req);

  const dayOnly = new Date(parsedDate);
  dayOnly.setHours(0, 0, 0, 0);

  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, subject: assignment.subject, date: dayOnly },
      update: {
        $set: {
          status: r.status,
          assignment: assignment._id,
          markedBy: req.user._id,
        },
      },
      upsert: true,
    },
  }));

  if (ops.length > 0) await Attendance.bulkWrite(ops);
  res.json({ message: 'Attendance saved', count: ops.length });
});

const summary = asyncHandler(async (req, res) => {
  const { student, subject, from, to, groupBy } = req.query;
  if (!student) throw ApiError.badRequest('student is required');

  if (req.user.role === 'student' && req.studentProfile?._id.toString() !== student) {
    throw ApiError.forbidden('Not allowed');
  }

  if (req.user.role === 'teacher') {
    const { teacherCanAccessStudent } = require('../services/scope');
    const studentDoc = await Student.findById(student);
    if (!studentDoc || !(await teacherCanAccessStudent(req.teacherProfile._id, studentDoc))) {
      throw ApiError.forbidden('Not allowed');
    }
  }

  if (!groupBy || groupBy === 'semester') {
    const overall = await computePercent({ student, subject, from, to });
    return res.json(overall);
  }

  const filter = { student };
  if (subject) filter.subject = subject;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const records = await Attendance.find(filter).populate('subject', 'name code');

  const buckets = new Map();
  for (const rec of records) {
    let key;
    if (groupBy === 'day') key = rec.date.toISOString().slice(0, 10);
    else if (groupBy === 'month') key = rec.date.toISOString().slice(0, 7);
    else if (groupBy === 'subject') key = rec.subject?.name || 'Unknown';
    else key = 'all';

    if (!buckets.has(key)) buckets.set(key, { present: 0, total: 0 });
    const bucket = buckets.get(key);
    bucket.total += 1;
    if (rec.status === 'present') bucket.present += 1;
  }

  const result = Array.from(buckets.entries()).map(([key, { present, total }]) => ({
    key,
    present,
    total,
    percent: total > 0 ? round1((present / total) * 100) : 0,
  }));

  res.json(result);
});

const analytics = asyncHandler(async (req, res) => {
  const thresholdSetting = await Setting.findOne({ key: 'attendanceThreshold' });
  const warningSetting = await Setting.findOne({ key: 'attendanceWarning' });
  const threshold = thresholdSetting?.value ?? 75;
  const warning = warningSetting?.value ?? 65;

  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.course) filter.course = req.query.course;
  if (req.query.section) filter.section = req.query.section;

  const students = await Student.find(filter).populate('user', 'name').populate('department', 'name');

  const belowThreshold = [];
  const byDepartment = new Map();

  for (const s of students) {
    const { percent } = await computePercent({ student: s._id });
    const deptName = s.department?.name || 'Unknown';
    if (!byDepartment.has(deptName)) byDepartment.set(deptName, { sum: 0, count: 0 });
    const d = byDepartment.get(deptName);
    d.sum += percent;
    d.count += 1;

    if (percent < threshold) {
      belowThreshold.push({
        student: s._id,
        studentId: s.studentId,
        name: s.user?.name,
        section: s.section,
        percent,
      });
    }
  }

  const departmentAverages = Array.from(byDepartment.entries()).map(([name, { sum, count }]) => ({
    department: name,
    average: count > 0 ? round1(sum / count) : 0,
  }));

  res.json({ threshold, warning, departmentAverages, belowThreshold });
});

module.exports = { getSheet, saveSheet, summary, analytics };
