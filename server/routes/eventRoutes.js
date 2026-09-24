const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/eventController');
const extra = require('../controllers/eventExtrasController');

const router = express.Router();
router.use(protect);
router.get('/', ctrl.list);
router.get('/calendar', ctrl.calendar);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.patch('/:id', ctrl.update);
router.post('/:id/review', authorize('admin'), ctrl.review);
router.post('/:id/progress', ctrl.progress);

router.get('/:id/participants', extra.listParticipants);
router.post('/:id/participants', extra.addParticipant);
router.patch('/:id/participants/:pid', extra.updateParticipant);
router.delete('/:id/participants/:pid', extra.removeParticipant);

router.get('/:id/feedback', extra.listFeedback);
router.post('/:id/feedback', extra.addFeedback);

router.get('/:id/certificates', extra.listCertificates);
router.post('/:id/certificates', extra.issueCertificates);
router.get('/:id/certificates/:cid/pdf', extra.downloadCertificate);
router.get('/:id/report.pdf', extra.reportPdf);

module.exports = router;
