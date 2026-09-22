const express = require('express');
const router = express.Router();
const { 
  getAllocations, 
  allocateResource, 
  returnAllocation,
  deleteAllocation 
} = require('../controllers/allocationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAllocations);
router.post('/', authMiddleware, allocateResource);
router.patch('/:id/return', authMiddleware, returnAllocation);
router.delete('/:id', authMiddleware, deleteAllocation);

module.exports = router;