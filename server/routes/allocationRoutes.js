const express = require('express');
const { allocateResource } = require('../controllers/allocationController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, allocateResource);

module.exports = router;