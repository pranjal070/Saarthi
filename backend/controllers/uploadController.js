const multer = require('multer'), path = require('path'), fs = require('fs'), HttpError = require('../utils/HttpError');
const UP = path.join(__dirname, '..', 'uploads'); fs.mkdirSync(UP, { recursive: true });
/* Multer: store images/PDF up to 5 MB on disk with a safe, timestamped file name */
exports.UP = UP;
exports.uploadMiddleware = multer({
  storage: multer.diskStorage({ destination: UP, filename: (q, f, cb) => cb(null, Date.now() + '-' + f.originalname.replace(/[^\w.\-]/g, '_')) }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (q, f, cb) => cb(/^image\/(jpeg|png|webp)$|^application\/pdf$/.test(f.mimetype) ? null : new HttpError(400, 'Only JPG, PNG, WEBP or PDF files are allowed.'), true)
}).single('file');
/* POST /api/upload */
exports.upload = (req, res) => { if (!req.file) throw new HttpError(400, 'No file received.'); res.status(201).json({ ok: true, url: '/uploads/' + req.file.filename }); };
