const { Club, ClubMember } = require('../models');
const { crudFactory } = require('../utils/crudFactory');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const base = crudFactory(Club, {
  populate: [
    { path: 'facultyCoordinator', select: 'user', populate: { path: 'user', select: 'name' } },
    { path: 'studentCoordinator', select: 'user studentId', populate: { path: 'user', select: 'name' } },
  ],
  searchFields: ['name'],
  blockDeleteRefs: [{ model: ClubMember, field: 'club', label: 'member' }],
});

const listMembers = asyncHandler(async (req, res) => {
  const members = await ClubMember.find({ club: req.params.id }).populate({
    path: 'student',
    select: 'user studentId',
    populate: { path: 'user', select: 'name' },
  });
  res.json(members);
});

const addMember = asyncHandler(async (req, res) => {
  const { student, role } = req.body;
  if (!student) throw ApiError.badRequest('student is required');
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');

  const exists = await ClubMember.findOne({ club: req.params.id, student });
  if (exists) throw ApiError.conflict('Student is already a member');

  const member = await ClubMember.create({ club: req.params.id, student, role: role || 'member' });
  res.status(201).json(member);
});

const removeMember = asyncHandler(async (req, res) => {
  const member = await ClubMember.findOneAndDelete({
    club: req.params.id,
    student: req.params.studentId,
  });
  if (!member) throw ApiError.notFound('Membership not found');
  res.json({ message: 'Removed' });
});

module.exports = { ...base, listMembers, addMember, removeMember };
