/* Lets controllers be async functions: any thrown error is passed to Express's error middleware via next(). */
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
