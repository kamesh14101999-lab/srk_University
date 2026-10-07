const { Announcement, Notification, Student, TeachingAssignment } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/crudFactory');

const populateFields = [
  { path: 'createdBy', select: 'name role' },
  {
    path: 'assignment',
    select: 'course semester section subject',
    populate: { path: 'subject', select: 'name' },
  },
];

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  let filter;

  if (req.user.role === 'admin') {
    filter = {};
  } else if (req.user.role === 'teacher') {
    filter = { audience: { $in: ['all', 'teachers'] } };
  } else {
    const sp = req.studentProfile;
    const assignments = await TeachingAssignment.find({
      course: sp.course,
      semester: sp.semester,
      section: sp.section,
    }).select('_id');
    filter = {
      $or: [
        { audience: { $in: ['all', 'students'] } },
        { audience: 'assignment', assignment: { $in: assignments.map((a) => a._id) } },
      ],
    };
  }

  const [items, total] = await Promise.all([
    Announcement.find(filter)
      .populate(populateFields)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Announcement.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

const create = asyncHandler(async (req, res) => {
  const { title, body, category, audience, assignment, isPinned } = req.body;
  if (!title || !body || !audience) throw ApiError.badRequest('title, body, and audience are required');

  if (req.user.role === 'teacher') {
    if (audience !== 'assignment') {
      throw ApiError.forbidden('Teachers can only post to audience "assignment"');
    }
    const owns = await TeachingAssignment.findOne({ _id: assignment, teacher: req.teacherProfile._id });
    if (!owns) throw ApiError.forbidden('You do not own this teaching assignment');
  }

  const announcement = await Announcement.create({
    title,
    body,
    category,
    audience,
    assignment: audience === 'assignment' ? assignment : undefined,
    createdBy: req.user._id,
    isPinned: req.user.role === 'admin' ? !!isPinned : false,
  });

  await notifyAudience(announcement);

  const populated = await announcement.populate(populateFields);
  res.status(201).json(populated);
});

async function notifyAudience(announcement) {
  let userIds = [];

  if (announcement.audience === 'all') {
    const { User } = require('../models');
    const users = await User.find({ isActive: true }).select('_id');
    userIds = users.map((u) => u._id);
  } else if (announcement.audience === 'teachers') {
    const { User } = require('../models');
    const users = await User.find({ role: 'teacher', isActive: true }).select('_id');
    userIds = users.map((u) => u._id);
  } else if (announcement.audience === 'students') {
    const { User } = require('../models');
    const users = await User.find({ role: 'student', isActive: true }).select('_id');
    userIds = users.map((u) => u._id);
  } else if (announcement.audience === 'assignment') {
    const assignment = await TeachingAssignment.findById(announcement.assignment);
    const students = await Student.find({
      course: assignment.course,
      semester: assignment.semester,
      section: assignment.section,
    }).select('user');
    userIds = students.map((s) => s.user);
  }

  if (userIds.length > 0) {
    await Notification.insertMany(
      userIds.map((user) => ({
        user,
        title: announcement.title,
        message: announcement.body.slice(0, 200),
        link: '/announcements',
      }))
    );
  }
}

const update = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw ApiError.notFound('Announcement not found');

  if (
    req.user.role !== 'admin' &&
    announcement.createdBy.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('Not allowed');
  }

  Object.assign(announcement, req.body);
  await announcement.save();
  const populated = await announcement.populate(populateFields);
  res.json(populated);
});

const remove = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw ApiError.notFound('Announcement not found');

  if (
    req.user.role !== 'admin' &&
    announcement.createdBy.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('Not allowed');
  }

  await announcement.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = { list, create, update, remove };
