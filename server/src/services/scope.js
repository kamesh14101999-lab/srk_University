const { TeachingAssignment, Student } = require('../models');

// All teaching assignments owned by this teacher.
async function getTeacherAssignments(teacherId) {
  return TeachingAssignment.find({ teacher: teacherId });
}

// Student ids visible to a teacher, derived from their teaching assignments.
async function getTeacherStudentIds(teacherId) {
  const assignments = await getTeacherAssignments(teacherId);
  if (assignments.length === 0) return [];

  const orClauses = assignments.map((a) => ({
    course: a.course,
    semester: a.semester,
    section: a.section,
  }));

  const students = await Student.find({ $or: orClauses }).select('_id');
  return students.map((s) => s._id.toString());
}

// Does this teacher have an assignment that covers the given student?
async function teacherCanAccessStudent(teacherId, student) {
  const assignments = await getTeacherAssignments(teacherId);
  return assignments.some(
    (a) =>
      a.course.toString() === student.course.toString() &&
      a.semester === student.semester &&
      a.section === student.section
  );
}

// Does this teacher own the given assignment id?
async function teacherOwnsAssignment(teacherId, assignmentId) {
  const assignment = await TeachingAssignment.findById(assignmentId);
  if (!assignment) return null;
  if (assignment.teacher.toString() !== teacherId.toString()) return false;
  return assignment;
}

module.exports = {
  getTeacherAssignments,
  getTeacherStudentIds,
  teacherCanAccessStudent,
  teacherOwnsAssignment,
};
