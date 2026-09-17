const express = require('express');
const { getResources } = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getResources);

module.exports = router;