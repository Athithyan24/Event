const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/venueController');

const router = express.Router();
router.use(protect);
router.get('/', ctrl.list);
router.get('/matrix', ctrl.matrix);
router.post('/availability', ctrl.checkAvailability);
router.post('/', authorize('admin'), ctrl.create);
router.patch('/:id', authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
