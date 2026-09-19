const express = require('express');
// Import both functions from the controller
const { allocateResource, getAllocations } = require('../controllers/allocationController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Add the GET route to resolve the 404
router.get('/', authMiddleware, getAllocations);

// Your existing POST route
router.post('/', authMiddleware, allocateResource);

module.exports = router;