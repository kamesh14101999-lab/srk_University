const express = require('express');
const controller = require('../controllers/public.controller');

const router = express.Router();

router.get('/university', controller.university);
router.get('/departments', controller.departments);
router.get('/courses', controller.courses);
router.get('/faculty', controller.faculty);
router.get('/facilities', controller.facilities);
router.get('/events', controller.events);
router.get('/fests', controller.fests);
router.get('/clusters', controller.clusters);
router.get('/sports', controller.sports);
router.get('/announcements', controller.announcements);
router.get('/calendar', controller.calendar);

module.exports = router;
