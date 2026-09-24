const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
