const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('./ApiError');

function getPagination(req) {
  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 20;
  if (page < 1) page = 1;
  if (limit < 1) limit = 20;
  if (limit > 100) limit = 100;
  return { page, limit, skip: (page - 1) * limit };
}

// Builds standard list/get/create/update/delete handlers for a Mongoose model.
// options:
//   populate: string | array of fields to populate
//   searchFields: fields that `search` query param matches against (case-insensitive regex)
//   filterFields: query params copied straight into the Mongo filter if present
//   blockDeleteRefs: [{ model, field, label }] - refuse delete with 409 if any doc references this one
//   buildFilter: (req) => extra filter object, merged in
function crudFactory(Model, options = {}) {
  const {
    populate,
    searchFields = [],
    filterFields = [],
    blockDeleteRefs = [],
    buildFilter,
  } = options;

  const list = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const filter = {};

    for (const field of filterFields) {
      if (req.query[field] !== undefined && req.query[field] !== '') {
        filter[field] = req.query[field];
      }
    }

    if (req.query.search && searchFields.length > 0) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = searchFields.map((f) => ({ [f]: regex }));
    }

    if (buildFilter) {
      Object.assign(filter, buildFilter(req));
    }

    let query = Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    if (populate) query = query.populate(populate);

    const [items, total] = await Promise.all([query, Model.countDocuments(filter)]);
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  });

  const getOne = asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populate) query = query.populate(populate);
    const doc = await query;
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    res.json(doc);
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json(doc);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    res.json(doc);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);

    for (const ref of blockDeleteRefs) {
      const count = await ref.model.countDocuments({ [ref.field]: req.params.id });
      if (count > 0) {
        throw ApiError.conflict(
          `Cannot delete: ${count} ${ref.label || ref.model.modelName} record(s) still reference this`
        );
      }
    }

    await doc.deleteOne();
    res.json({ message: 'Deleted' });
  });

  return { list, getOne, create, update, remove };
}

module.exports = { crudFactory, getPagination };
