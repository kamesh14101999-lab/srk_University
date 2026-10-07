const {
  Student,
  User,
  Attendance,
  Exam,
  Mark,
  Result,
  Event,
  Fest,
  ClusterActivity,
  Team,
  ClubMember,
  Achievement,
} = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/crudFactory');
const { teacherCanAccessStudent } = require('../services/scope');
const { computePercent } = require('../services/attendanceStats');

const populateFields = [
  { path: 'user', select: 'name email isActive lastLoginAt' },
  { path: 'department', select: 'name code' },
  { path: 'course', select: 'name code' },
];

async function assertCanAccessStudent(req, student) {
  if (req.user.role === 'admin') return;
  if (req.user.role === 'student') {
    if (req.studentProfile?._id.toString() !== student._id.toString()) {
      throw ApiError.forbidden('Not allowed');
    }
    return;
  }
  if (req.user.role === 'teacher') {
    const ok = await teacherCanAccessStudent(req.teacherProfile._id, student);
    if (!ok) throw ApiError.forbidden('Not allowed');
    return;
  }
  throw ApiError.forbidden('Not allowed');
}

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.course) filter.course = req.query.course;
  if (req.query.year) filter.year = req.query.year;
  if (req.query.semester) filter.semester = req.query.semester;
  if (req.query.section) filter.section = req.query.section;
  if (req.query.batch) filter.batch = req.query.batch;
  if (req.query.status) filter.academicStatus = req.query.status;

  const andClauses = [];

  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    const matchingUsers = await User.find({ name: regex, role: 'student' }).select('_id');
    andClauses.push({
      $or: [
        { studentId: regex },
        { rollNumber: regex },
        { user: { $in: matchingUsers.map((u) => u._id) } },
      ],
    });
  }

  if (req.user.role === 'teacher') {
    const { getTeacherAssignments } = require('../services/scope');
    const assignments = await getTeacherAssignments(req.teacherProfile._id);
    if (assignments.length === 0) {
      andClauses.push({ _id: null });
    } else {
      andClauses.push({
        $or: assignments.map((a) => ({ course: a.course, semester: a.semester, section: a.section })),
      });
    }
  } else if (req.user.role === 'student') {
    throw ApiError.forbidden('Not allowed');
  }

  if (andClauses.length > 0) filter.$and = andClauses;

  const [items, total] = await Promise.all([
    Student.find(filter).populate(populateFields).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

const getOne = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate(populateFields);
  if (!student) throw ApiError.notFound('Student not found');
  await assertCanAccessStudent(req, student);
  res.json(student);
});

const create = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    studentId,
    rollNumber,
    photoUrl,
    dob,
    gender,
    phone,
    address,
    guardianName,
    guardianPhone,
    emergencyContact,
    bloodGroup,
    department,
    course,
    year,
    semester,
    section,
    admissionYear,
    batch,
    academicStatus,
  } = req.body;

  if (!name || !email || !studentId || !rollNumber || !dob || !gender || !department || !course) {
    throw ApiError.badRequest(
      'name, email, studentId, rollNumber, dob, gender, department, and course are required'
    );
  }

  const { seedDefaultPassword } = require('../config/env');
  const user = await User.create({
    name,
    email,
    password: password || seedDefaultPassword,
    role: 'student',
  });

  try {
    const student = await Student.create({
      user: user._id,
      studentId,
      rollNumber,
      photoUrl,
      dob,
      gender,
      phone,
      address,
      guardianName,
      guardianPhone,
      emergencyContact,
      bloodGroup,
      department,
      course,
      year,
      semester,
      section,
      admissionYear,
      batch,
      academicStatus,
    });
    const populated = await student.populate(populateFields);
    res.status(201).json(populated);
  } catch (err) {
    await user.deleteOne();
    throw err;
  }
});

const update = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');

  const { name, email, ...studentFields } = req.body;
  if (name || email) {
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    await User.findByIdAndUpdate(student.user, userUpdate);
  }

  Object.assign(student, studentFields);
  await student.save();
  const populated = await student.populate(populateFields);
  res.json(populated);
});

const remove = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  await student.deleteOne();
  await User.findByIdAndDelete(student.user);
  res.json({ message: 'Deleted' });
});

const addRemark = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') throw ApiError.forbidden('Only teachers can add remarks');
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');

  const ok = await teacherCanAccessStudent(req.teacherProfile._id, student);
  if (!ok) throw ApiError.forbidden('Not allowed');

  const { text } = req.body;
  if (!text) throw ApiError.badRequest('text is required');

  student.remarks.push({ teacher: req.teacherProfile._id, text, date: new Date() });
  await student.save();
  res.status(201).json(student);
});

const getAttendance = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  await assertCanAccessStudent(req, student);

  const overall = await computePercent({ student: student._id });
  const bySubject = await Attendance.aggregate([
    { $match: { student: student._id } },
    {
      $group: {
        _id: '$subject',
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
      },
    },
  ]);

  const populatedBySubject = await Promise.all(
    bySubject.map(async (row) => {
      const subjectDoc = await require('../models').Subject.findById(row._id).select('name code');
      return {
        subject: subjectDoc,
        present: row.present,
        total: row.total,
        percent: row.total > 0 ? Math.round((row.present / row.total) * 1000) / 10 : 0,
      };
    })
  );

  res.json({ overall, bySubject: populatedBySubject });
});

const getMarks = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  await assertCanAccessStudent(req, student);

  const filter = { student: student._id };
  const marks = await Mark.find(filter).populate({
    path: 'exam',
    select: 'name type subject maxMarks isPublished date',
    populate: { path: 'subject', select: 'name code' },
  });

  const visible =
    req.user.role === 'student' ? marks.filter((m) => m.exam?.isPublished) : marks;

  res.json(visible);
});

const getResults = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  await assertCanAccessStudent(req, student);

  const filter = { student: student._id };
  if (req.user.role === 'student') filter.isPublished = true;

  const results = await Result.find(filter)
    .populate('course', 'name code')
    .populate('academicYear', 'label')
    .populate('subjects.subject', 'name code')
    .sort({ semester: 1 });

  res.json(results);
});

const getActivities = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  await assertCanAccessStudent(req, student);

  const sid = student._id;
  const [events, fests, clusters, teams, clubMemberships, achievements] = await Promise.all([
    Event.find({ participants: sid }).select('name type date status'),
    Fest.find({ participants: sid }).select('name year startDate endDate'),
    ClusterActivity.find({ participants: sid }).select('clusterName activityName date'),
    Team.find({ players: sid }).select('name sport tournament').populate('sport', 'name'),
    ClubMember.find({ student: sid }).populate('club', 'name'),
    Achievement.find({ student: sid }).sort({ date: -1 }),
  ]);

  res.json({ events, fests, clusters, teams, clubMemberships, achievements });
});

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  addRemark,
  getAttendance,
  getMarks,
  getResults,
  getActivities,
};
