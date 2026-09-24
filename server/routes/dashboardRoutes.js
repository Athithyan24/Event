const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

const router = express.Router();
router.use(protect);
router.get('/overview', ctrl.overview);
router.get('/search', ctrl.search);
router.get('/notifications', ctrl.notifications);
router.post('/notifications/read-all', ctrl.readAllNotifications);
router.patch('/notifications/:id', ctrl.readNotification);
router.get('/announcements', ctrl.announcements);
router.post('/announcements', authorize('admin'), ctrl.createAnnouncement);
router.get('/activity', authorize('admin'), ctrl.activity);
router.get('/feedback', ctrl.feedbackAnalytics);

module.exports = router;
