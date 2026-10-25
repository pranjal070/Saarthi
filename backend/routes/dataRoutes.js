const router = require('express').Router(), c = require('../controllers/dataController'), { need } = require('../middleware/auth');
router.get('/db', c.getDb);
router.put('/db/:key', need, c.putCollection);
router.post('/seq/:name', need, c.nextSeq);
module.exports = router;
