const {
  UniversityInfo,
  Department,
  Course,
  Teacher,
  Facility,
  Event,
  Fest,
  ClusterActivity,
  Sport,
  Announcement,
  CalendarEntry,
} = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

const university = asyncHandler(async (req, res) => {
  let info = await UniversityInfo.findOne();
  if (!info) info = await UniversityInfo.create({});
  res.json(info);
});

const departments = asyncHandler(async (req, res) => {
  const items = await Department.find().select('name code description email phone');
  res.json(items);
});

const courses = asyncHandler(async (req, res) => {
  const items = await Course.find({ isActive: true })
    .select('name code degreeType durationYears totalSemesters eligibility description intake department')
    .populate('department', 'name code');
  res.json(items);
});

const faculty = asyncHandler(async (req, res) => {
  const items = await Teacher.find({ status: 'active' })
    .select('designation department photoUrl user')
    .populate('user', 'name')
    .populate('department', 'name code');
  res.json(
    items.map((t) => ({
      name: t.user?.name,
      designation: t.designation,
      department: t.department,
      photoUrl: t.photoUrl,
    }))
  );
});

const facilities = asyncHandler(async (req, res) => {
  const items = await Facility.find();
  res.json(items);
});

const events = asyncHandler(async (req, res) => {
  const items = await Event.find().sort({ date: -1 }).limit(50);
  res.json(items);
});

const fests = asyncHandler(async (req, res) => {
  const items = await Fest.find().sort({ year: -1 });
  res.json(items);
});

const clusters = asyncHandler(async (req, res) => {
  const items = await ClusterActivity.find().sort({ date: -1 }).limit(50);
  res.json(items);
});

const sports = asyncHandler(async (req, res) => {
  const items = await Sport.find();
  res.json(items);
});

const announcements = asyncHandler(async (req, res) => {
  const items = await Announcement.find({ audience: 'all' }).sort({ isPinned: -1, createdAt: -1 }).limit(20);
  res.json(items);
});

const calendar = asyncHandler(async (req, res) => {
  const items = await CalendarEntry.find().sort({ startDate: 1 });
  res.json(items);
});

module.exports = {
  university,
  departments,
  courses,
  faculty,
  facilities,
  events,
  fests,
  clusters,
  sports,
  announcements,
  calendar,
};
