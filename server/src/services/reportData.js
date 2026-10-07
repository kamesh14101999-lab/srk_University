const {
  Student,
  Teacher,
  Attendance,
  Mark,
  Result,
  Department,
  Course,
  Event,
  Tournament,
  Achievement,
} = require('../models');
const { computePercent } = require('./attendanceStats');

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function studentsReport(filters) {
  const filter = {};
  if (filters.department) filter.department = filters.department;
  if (filters.course) filter.course = filters.course;
  if (filters.semester) filter.semester = filters.semester;
  if (filters.section) filter.section = filters.section;

  const students = await Student.find(filter)
    .populate('user', 'name email')
    .populate('department', 'name')
    .populate('course', 'name');

  return {
    title: 'Students Report',
    columns: ['Student ID', 'Name', 'Email', 'Department', 'Course', 'Year', 'Semester', 'Section', 'Status'],
    rows: students.map((s) => [
      s.studentId,
      s.user?.name,
      s.user?.email,
      s.department?.name,
      s.course?.name,
      s.year,
      s.semester,
      s.section,
      s.academicStatus,
    ]),
  };
}

async function facultyReport(filters) {
  const filter = {};
  if (filters.department) filter.department = filters.department;

  const teachers = await Teacher.find(filter).populate('user', 'name email').populate('department', 'name');

  return {
    title: 'Faculty Report',
    columns: ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Status'],
    rows: teachers.map((t) => [t.employeeId, t.user?.name, t.user?.email, t.department?.name, t.designation, t.status]),
  };
}

async function attendanceReport(filters) {
  const filter = {};
  if (filters.department) filter.department = filters.department;
  if (filters.course) filter.course = filters.course;

  const students = await Student.find(filter).populate('user', 'name');
  const rows = [];
  for (const s of students) {
    const { present, total, percent } = await computePercent({
      student: s._id,
      from: filters.from,
      to: filters.to,
    });
    rows.push([s.studentId, s.user?.name, s.section, present, total, `${percent}%`]);
  }

  return {
    title: 'Attendance Report',
    columns: ['Student ID', 'Name', 'Section', 'Present', 'Total', 'Percent'],
    rows,
  };
}

async function marksReport(filters) {
  const filter = {};
  if (filters.exam) filter.exam = filters.exam;

  const marks = await Mark.find(filter)
    .populate({ path: 'student', select: 'studentId user', populate: { path: 'user', select: 'name' } })
    .populate('exam', 'name maxMarks');

  return {
    title: 'Marks Report',
    columns: ['Student ID', 'Name', 'Exam', 'Obtained', 'Max Marks', 'Absent'],
    rows: marks.map((m) => [
      m.student?.studentId,
      m.student?.user?.name,
      m.exam?.name,
      m.obtained,
      m.exam?.maxMarks,
      m.isAbsent ? 'Yes' : 'No',
    ]),
  };
}

async function gradesReport(filters) {
  const filter = {};
  if (filters.course) filter.course = filters.course;
  if (filters.semester) filter.semester = filters.semester;
  if (filters.academicYear) filter.academicYear = filters.academicYear;

  const results = await Result.find(filter)
    .populate({ path: 'student', select: 'studentId user', populate: { path: 'user', select: 'name' } })
    .populate('subjects.subject', 'name');

  const rows = [];
  for (const r of results) {
    for (const s of r.subjects) {
      rows.push([r.student?.studentId, r.student?.user?.name, s.subject?.name, s.obtained, s.maxMarks, s.grade, s.gradePoint, s.status]);
    }
  }

  return {
    title: 'Grades Report',
    columns: ['Student ID', 'Name', 'Subject', 'Obtained', 'Max', 'Grade', 'Grade Point', 'Status'],
    rows,
  };
}

async function semesterResultsReport(filters) {
  const filter = {};
  if (filters.course) filter.course = filters.course;
  if (filters.semester) filter.semester = filters.semester;
  if (filters.academicYear) filter.academicYear = filters.academicYear;

  const results = await Result.find(filter).populate({
    path: 'student',
    select: 'studentId user',
    populate: { path: 'user', select: 'name' },
  });

  return {
    title: 'Semester Results Report',
    columns: ['Student ID', 'Name', 'Semester', 'Total', 'Percentage', 'SGPA', 'CGPA', 'Status', 'Backlogs'],
    rows: results.map((r) => [
      r.student?.studentId,
      r.student?.user?.name,
      r.semester,
      `${r.totalObtained}/${r.totalMax}`,
      r.percentage,
      r.sgpa,
      r.cgpa,
      r.status,
      r.backlogs,
    ]),
  };
}

async function departmentPerformanceReport() {
  const departments = await Department.find();
  const rows = [];
  for (const d of departments) {
    const courses = await Course.find({ department: d._id }).select('_id');
    const results = await Result.find({ course: { $in: courses.map((c) => c._id) }, isPublished: true });
    const average = results.length ? round2(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;
    rows.push([d.name, d.code, results.length, average]);
  }

  return { title: 'Department Performance Report', columns: ['Department', 'Code', 'Results Count', 'Average %'], rows };
}

async function coursePerformanceReport() {
  const courses = await Course.find().populate('department', 'name');
  const rows = [];
  for (const c of courses) {
    const results = await Result.find({ course: c._id, isPublished: true });
    const average = results.length ? round2(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;
    rows.push([c.name, c.department?.name, results.length, average]);
  }

  return { title: 'Course Performance Report', columns: ['Course', 'Department', 'Results Count', 'Average %'], rows };
}

async function eventParticipationReport() {
  const events = await Event.find();
  return {
    title: 'Event Participation Report',
    columns: ['Event', 'Type', 'Date', 'Status', 'Participants'],
    rows: events.map((e) => [e.name, e.type, e.date?.toISOString().slice(0, 10), e.status, e.participants.length]),
  };
}

async function sportsParticipationReport() {
  const tournaments = await Tournament.find().populate('sport', 'name');
  return {
    title: 'Sports Participation Report',
    columns: ['Tournament', 'Sport', 'Status', 'Start Date', 'End Date'],
    rows: tournaments.map((t) => [
      t.name,
      t.sport?.name,
      t.status,
      t.startDate?.toISOString().slice(0, 10),
      t.endDate?.toISOString().slice(0, 10),
    ]),
  };
}

async function achievementsReport() {
  const achievements = await Achievement.find().populate({
    path: 'student',
    select: 'studentId user',
    populate: { path: 'user', select: 'name' },
  });
  return {
    title: 'Achievements Report',
    columns: ['Student ID', 'Name', 'Title', 'Category', 'Date'],
    rows: achievements.map((a) => [
      a.student?.studentId,
      a.student?.user?.name,
      a.title,
      a.category,
      a.date?.toISOString().slice(0, 10),
    ]),
  };
}

const REPORTS = {
  students: studentsReport,
  faculty: facultyReport,
  attendance: attendanceReport,
  marks: marksReport,
  grades: gradesReport,
  'semester-results': semesterResultsReport,
  'department-performance': departmentPerformanceReport,
  'course-performance': coursePerformanceReport,
  'event-participation': eventParticipationReport,
  'sports-participation': sportsParticipationReport,
  achievements: achievementsReport,
};

module.exports = { REPORTS };
