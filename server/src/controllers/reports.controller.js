const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { REPORTS } = require('../services/reportData');
const { renderExcel, renderPdf } = require('../services/reportRenderer');

const generate = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { format = 'xlsx', ...filters } = req.query;

  const builder = REPORTS[type];
  if (!builder) throw ApiError.badRequest(`Unknown report type: ${type}`);
  if (!['pdf', 'xlsx'].includes(format)) throw ApiError.badRequest('format must be pdf or xlsx');

  const data = await builder(filters);
  const filename = `${type}-${new Date().toISOString().slice(0, 10)}.${format}`;

  if (format === 'xlsx') {
    const buffer = await renderExcel(data);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } else {
    const buffer = await renderPdf(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
});

module.exports = { generate };
