const Participant = require('../models/Participant');
const Feedback = require('../models/Feedback');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const { asyncHandler } = require('../middleware/error');
const { addTimeline } = require('../utils/audit');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

exports.listParticipants = asyncHandler(async (req, res) => {
  const rows = await Participant.find({ event: req.params.id }).sort({ createdAt: 1 });
  res.json(rows);
});

exports.addParticipant = asyncHandler(async (req, res) => {
  const row = await Participant.create({ ...req.body, event: req.params.id });
  res.status(201).json(row);
});

exports.updateParticipant = asyncHandler(async (req, res) => {
  const row = await Participant.findByIdAndUpdate(req.params.pid, req.body, { new: true });
  res.json(row);
});

exports.removeParticipant = asyncHandler(async (req, res) => {
  await Participant.findByIdAndDelete(req.params.pid);
  res.json({ ok: true });
});

exports.listFeedback = asyncHandler(async (req, res) => {
  const rows = await Feedback.find({ event: req.params.id }).sort({ createdAt: -1 });
  const avg = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;
  res.json({ rows, average: Number(avg.toFixed(2)), count: rows.length });
});

exports.addFeedback = asyncHandler(async (req, res) => {
  const row = await Feedback.create({ ...req.body, event: req.params.id });
  res.status(201).json(row);
});

exports.listCertificates = asyncHandler(async (req, res) => {
  const rows = await Certificate.find({ event: req.params.id }).sort({ createdAt: -1 });
  res.json(rows);
});

exports.issueCertificates = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const names = req.body.names || (await Participant.find({ event: event._id, attended: true })).map((p) => p.name);
  const created = [];
  for (const name of names) {
    const certificateId = `AURA-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const doc = await Certificate.create({ event: event._id, participantName: name, certificateId });
    created.push(doc);
  }
  await addTimeline(event._id, { action: 'Certificates issued', detail: `${created.length} certificates`, actor: req.user._id });
  res.status(201).json(created);
});

exports.downloadCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.cid).populate({
    path: 'event',
    populate: { path: 'department', select: 'name' },
  });
  if (!cert) return res.status(404).json({ message: 'Certificate not found' });
  const event = cert.event;
  const date = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${cert.certificateId}.pdf`);

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 48 });
  doc.pipe(res);
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#111111');
  doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(1).stroke('#E8D5A3');
  doc.fillColor('#E8D5A3').fontSize(12).text('AURA  ·  SMART EVENT PLANNING', 48, 60, { align: 'center' });
  doc.fillColor('#ffffff').fontSize(42).font('Times-Bold').text('Certificate of Participation', 48, 110, { align: 'center' });
  doc.fillColor('#b8b8b8').fontSize(14).font('Times-Roman').text('This is to certify that', 48, 180, { align: 'center' });
  doc.fillColor('#ffffff').fontSize(32).font('Times-BoldItalic').text(cert.participantName, 48, 210, { align: 'center' });
  doc.fillColor('#b8b8b8').fontSize(14).font('Times-Roman').text(`has participated in ${event.title}`, 48, 270, { align: 'center' });
  doc.text(`${event.type}  ·  ${event.department?.name || ''}  ·  ${date}`, 48, 294, { align: 'center' });
  doc.fillColor('#E8D5A3').fontSize(11).text(`Certificate ID  ${cert.certificateId}`, 48, 360, { align: 'center' });
  doc.end();
});

exports.reportPdf = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('department', 'name')
    .populate('venue', 'name location')
    .populate('organizer', 'name');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const participants = await Participant.find({ event: event._id });
  const feedback = await Feedback.find({ event: event._id });
  const avg = feedback.length ? feedback.reduce((s, r) => s + r.rating, 0) / feedback.length : 0;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${event.title.replace(/\s+/g, '_')}_report.pdf`);
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(20).text('Aura Event Closure Report', { align: 'left' });
  doc.moveDown(0.4);
  doc.fontSize(12).fillColor('#555').text(event.title);
  doc.moveDown();
  doc.fillColor('#111').fontSize(11);
  doc.text(`Department: ${event.department?.name || '-'}`);
  doc.text(`Organizer: ${event.organizer?.name || '-'}`);
  doc.text(`Venue: ${event.venue?.name || '-'} (${event.venue?.location || ''})`);
  doc.text(`Date: ${new Date(event.date).toDateString()}  ${event.startTime}–${event.endTime}`);
  doc.text(`Expected / Actual attendance: ${event.expectedAudience} / ${event.actualAudience}`);
  doc.text(`Budget planned / actual: ₹${event.budget?.planned || 0} / ₹${event.budget?.actual || 0}`);
  doc.text(`Sponsorship / Expenditure: ₹${event.budget?.sponsorship || 0} / ₹${event.budget?.expenditure || 0}`);
  doc.moveDown();
  doc.text(`Participants recorded: ${participants.length}`);
  doc.text(`Attended: ${participants.filter((p) => p.attended).length}`);
  doc.text(`Feedback responses: ${feedback.length}  ·  Average rating ${avg.toFixed(2)}`);
  doc.end();
});
