const express = require('express');
const { getResources, createResource } = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getResources);
router.post('/', authMiddleware, createResource);
module.exports = router;