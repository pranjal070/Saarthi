const multer = require('multer'), HttpError = require('../utils/HttpError');
const notFound = (req, res, next) => next(new HttpError(404, 'No such API route.'));
/* Centralised error handler — every thrown/forwarded error ends here and becomes clean JSON. */
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) err = new HttpError(400, err.message);
  const status = err.status || 500; if (status === 500) console.error(err);
  res.status(status).json({ ok: false, error: status === 500 ? 'Server error — please try again.' : err.message, field: err.field });
};
module.exports = { notFound, errorHandler };
