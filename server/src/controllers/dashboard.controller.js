const {
  Student,
  Teacher,
  Department,
  Course,
  Event,
  Exam,
  Result,
  Attendance,
  Announcement,
  TeachingAssignment,
  TimetableEntry,
  Tournament,
  Mark,
  Notification,
  Setting,
} = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { computePercent } = require('../services/attendanceStats');
const { getTeacherAssignments, getTeacherStudentIds } = require('../services/scope');

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const admin = asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    totalStudents,
    activeStudents,
    totalTeachers,
    totalDepartments,
    totalCourses,
    upcomingEvents,
    upcomingExams,
    recentResults,
    recentAnnouncements,
    upcomingTournaments,
  ] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ academicStatus: 'active' }),
    Teacher.countDocuments(),
    Department.countDocuments(),
    Course.countDocuments(),
    Event.find({ date: { $gte: now } }).sort({ date: 1 }).limit(5),
    Exam.find({ date: { $gte: now } }).sort({ date: 1 }).limit(5).populate('subject', 'name'),
    Result.find({ isPublished: true }).sort({ publishedAt: -1 }).limit(5).populate('student', 'studentId'),
    Announcement.find().sort({ createdAt: -1 }).limit(5),
    Tournament.find({ status: { $in: ['upcoming', 'ongoing'] } }).sort({ startDate: 1 }).limit(5).populate('sport', 'name'),
  ]);

  const threshold = (await Setting.findOne({ key: 'attendanceThreshold' }))?.value ?? 75;
  const students = await Student.find({ academicStatus: 'active' }).select('_id');
  let greenCount = 0;
  let amberCount = 0;
  let redCount = 0;
  for (const s of students.slice(0, 300)) {
    const { percent } = await computePercent({ student: s._id });
    if (percent >= threshold) greenCount += 1;
    else if (percent >= threshold - 10) amberCount += 1;
    else redCount += 1;
  }

  res.json({
    counts: {
      totalStudents,
      activeStudents,
      totalTeachers,
      totalDepartments,
      totalCourses,
      upcomingEventsCount: upcomingEvents.length,
      upcomingExamsCount: upcomingExams.length,
    },
    upcomingEvents,
    upcomingExams,
    recentResults,
    recentAnnouncements,
    upcomingTournaments,
    attendanceOverview: { green: greenCount, amber: amberCount, red: redCount },
  });
});

const teacher = asyncHandler(async (req, res) => {
  const teacherId = req.teacherProfile._id;
  const assignments = await getTeacherAssignments(teacherId);
  const populatedAssignments = await TeachingAssignment.find({ teacher: teacherId })
    .populate('subject', 'name code')
    .populate('course', 'name code');

  const todayName = DAY_NAMES[new Date().getDay()];
  const assignmentIds = assignments.map((a) => a._id);
  const todayTimetable = await TimetableEntry.find({
    assignment: { $in: assignmentIds },
    day: todayName,
  })
    .populate({
      path: 'assignment',
      populate: [
        { path: 'subject', select: 'name code' },
        { path: 'course', select: 'name code' },
      ],
    })
    .sort({ startTime: 1 });

  const studentIds = await getTeacherStudentIds(teacherId);
  const threshold = (await Setting.findOne({ key: 'attendanceThreshold' }))?.value ?? 75;
  const lowAttendance = [];
  for (const sid of studentIds.slice(0, 200)) {
    const { percent } = await computePercent({ student: sid });
    if (percent < threshold) lowAttendance.push({ student: sid, percent });
  }

  const subjectIds = assignments.map((a) => a.subject);
  const exams = await Exam.find({ subject: { $in: subjectIds }, isPublished: false }).select(
    'name subject maxMarks'
  );
  const pendingMarkEntry = [];
  for (const exam of exams) {
    const markCount = await Mark.countDocuments({ exam: exam._id });
    pendingMarkEntry.push({ exam, marksEntered: markCount });
  }

  res.json({
    classes: populatedAssignments,
    todayTimetable,
    lowAttendance: lowAttendance.slice(0, 10),
    pendingMarkEntry,
  });
});

const student = asyncHandler(async (req, res) => {
  const sp = req.studentProfile;
  const attendance = await computePercent({ student: sp._id });

  const latestResult = await Result.findOne({ student: sp._id, isPublished: true }).sort({
    semester: -1,
  });

  const assignments = await TeachingAssignment.find({
    course: sp.course,
    semester: sp.semester,
    section: sp.section,
  }).select('_id');
  const todayName = DAY_NAMES[new Date().getDay()];
  const todayTimetable = await TimetableEntry.find({
    assignment: { $in: assignments.map((a) => a._id) },
    day: todayName,
  })
    .populate({
      path: 'assignment',
      populate: [
        { path: 'subject', select: 'name code' },
        { path: 'teacher', select: 'user', populate: { path: 'user', select: 'name' } },
      ],
    })
    .sort({ startTime: 1 });

  const upcomingExams = await Exam.find({
    course: sp.course,
    semester: sp.semester,
    date: { $gte: new Date() },
  })
    .sort({ date: 1 })
    .limit(5)
    .populate('subject', 'name');

  const upcomingEvents = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(5);

  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    profile: sp,
    attendance,
    latestResult,
    todayTimetable,
    upcomingExams,
    upcomingEvents,
    notifications,
  });
});

module.exports = { admin, teacher, student };
