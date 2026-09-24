const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/departmentController');

const router = express.Router();
router.use(protect);
router.get('/', ctrl.list);
router.post('/', authorize('admin'), ctrl.create);
router.patch('/:id', authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);
router.post('/:id/assign', authorize('admin'), ctrl.assignUser);

module.exports = router;
