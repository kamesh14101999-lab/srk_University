const express = require('express');

const router = express.Router();

// Routes are mounted here as each resource is built.
router.use('/auth', require('./auth.routes'));
router.use('/public', require('./public.routes'));
router.use('/departments', require('./departments.routes'));
router.use('/courses', require('./courses.routes'));
router.use('/subjects', require('./subjects.routes'));
router.use('/academic-years', require('./academicYears.routes'));
router.use('/teaching-assignments', require('./teachingAssignments.routes'));
router.use('/users', require('./users.routes'));
router.use('/students', require('./students.routes'));
router.use('/teachers', require('./teachers.routes'));
router.use('/attendance', require('./attendance.routes'));
router.use('/exams', require('./exams.routes'));
router.use('/marks', require('./marks.routes'));
router.use('/grading-rules', require('./gradingRules.routes'));
router.use('/results', require('./results.routes'));
router.use('/events', require('./events.routes'));
router.use('/fests', require('./fests.routes'));
router.use('/clusters', require('./clusters.routes'));
router.use('/sports', require('./sports.routes'));
router.use('/tournaments', require('./tournaments.routes'));
router.use('/teams', require('./teams.routes'));
router.use('/fixtures', require('./fixtures.routes'));
router.use('/clubs', require('./clubs.routes'));
router.use('/achievements', require('./achievements.routes'));
router.use('/facilities', require('./facilities.routes'));
router.use('/timetable', require('./timetable.routes'));
router.use('/calendar', require('./calendar.routes'));
router.use('/announcements', require('./announcements.routes'));
router.use('/notifications', require('./notifications.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/reports', require('./reports.routes'));
router.use('/settings', require('./settings.routes'));
router.use('/university', require('./university.routes'));

module.exports = router;
