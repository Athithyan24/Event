const express = require('express');
const { getResources, createResource, updateResource, deleteResource } = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const { isAdmin } = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getResources);
router.post('/', authMiddleware, isAdmin, createResource);
router.put('/:id', authMiddleware, isAdmin, updateResource);
router.delete('/:id', authMiddleware, isAdmin, deleteResource);
module.exports = router;