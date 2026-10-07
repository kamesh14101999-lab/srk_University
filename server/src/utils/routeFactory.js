const express = require('express');
const { protect, authorize } = require('../middleware/auth');

// Standard read-for-all, write-for-admin route set for a CRUD controller.
function standardRoutes(controller, { createValidators = [], updateValidators = [] } = {}) {
  const router = express.Router();

  router.use(protect);
  router.get('/', controller.list);
  router.get('/:id', controller.getOne);
  router.post('/', authorize('admin'), ...createValidators, controller.create);
  router.patch('/:id', authorize('admin'), ...updateValidators, controller.update);
  router.delete('/:id', authorize('admin'), controller.remove);

  return router;
}

module.exports = { standardRoutes };
