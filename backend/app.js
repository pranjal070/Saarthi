const express = require('express'), helmet = require('helmet'), path = require('path');
const { auth } = require('./middleware/auth'), cors = require('./middleware/cors'), { notFound, errorHandler } = require('./middleware/errorHandler');
const { UP } = require('./controllers/uploadController');
const app = express();
app.set('trust proxy', 1);                                                       // behind Render's proxy: use the real visitor IP
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use('/api/auth', express.json({ limit: '50kb' })); app.use('/api/track', express.json({ limit: '10kb' }));
app.use(express.json({ limit: '8mb' }));
app.use(cors);
app.use('/api', auth);                                                           // every API call carries (optional) JWT identity
app.use('/api', require('./routes'));                                            // routes → controllers → services → models
app.use('/api', notFound);
app.use('/uploads', express.static(UP));
app.use(express.static(path.join(__dirname, '..', 'frontend')));                // the View: HTML / CSS / JS
app.use(errorHandler);
module.exports = app;
