const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Timeline = require('../models/Timeline');
const ResourceLog = require('../models/ResourceLog');

async function logActivity({ actor, action, entity, entityId, meta }) {
  await ActivityLog.create({ actor, action, entity, entityId, meta });
}

async function notify(user, { title, message, type, link }) {
  if (!user) return;
  await Notification.create({ user, title, message, type: type || 'system', link: link || '' });
}

async function notifyMany(userIds, payload) {
  const docs = userIds.filter(Boolean).map((user) => ({ user, ...payload }));
  if (docs.length) await Notification.insertMany(docs);
}

async function addTimeline(event, { action, detail, actor }) {
  await Timeline.create({ event, action, detail, actor });
}

async function logResource({ kind, resourceId, event, message }) {
  await ResourceLog.create({ kind, resourceId, event, message });
}

module.exports = { logActivity, notify, notifyMany, addTimeline, logResource };
