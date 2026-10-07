const { ClusterActivity } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(ClusterActivity, {
  populate: { path: 'departments', select: 'name code' },
  searchFields: ['clusterName', 'activityName'],
});
