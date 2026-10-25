/* An error that carries an HTTP status (and optionally the form field it belongs to). */
module.exports = class HttpError extends Error {
  constructor(status, message, field) { super(message); this.status = status; this.field = field; }
};
