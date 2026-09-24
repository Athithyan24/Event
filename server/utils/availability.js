function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
}

function timesOverlap(startA, endA, startB, endB) {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA);
}

function sameCalendarDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

const BLOCKING = ['pending', 'approved', 'in_progress'];

async function findVenueConflicts({ Event, venueId, date, startTime, endTime, excludeId }) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const query = {
    venue: venueId,
    status: { $in: BLOCKING },
    date: { $gte: dayStart, $lt: dayEnd },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const bookings = await Event.find(query).populate('department', 'name code');
  return bookings.filter((b) => timesOverlap(startTime, endTime, b.startTime, b.endTime));
}

async function suggestVenues({ Event, Venue, date, startTime, endTime, audience, excludeVenue }) {
  const venues = await Venue.find({
    status: 'available',
    capacity: { $gte: audience || 0 },
    ...(excludeVenue ? { _id: { $ne: excludeVenue } } : {}),
  }).sort({ capacity: 1 });

  const open = [];
  for (const venue of venues) {
    const conflicts = await findVenueConflicts({
      Event,
      venueId: venue._id,
      date,
      startTime,
      endTime,
    });
    if (!conflicts.length) open.push(venue);
  }
  return open.slice(0, 5);
}

async function equipmentAvailability({
  Equipment,
  EquipmentAllocation,
  itemId,
  quantity,
  date,
  startTime,
  endTime,
  excludeEventId,
}) {
  const item = await Equipment.findById(itemId);
  if (!item) return { ok: false, reason: 'Equipment not found', remaining: 0 };

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const query = {
    equipment: itemId,
    status: 'reserved',
    date: { $gte: dayStart, $lt: dayEnd },
  };
  if (excludeEventId) query.event = { $ne: excludeEventId };

  const rows = await EquipmentAllocation.find(query);
  const used = rows
    .filter((row) => timesOverlap(startTime, endTime, row.startTime, row.endTime))
    .reduce((sum, row) => sum + row.quantity, 0);

  const remaining = item.totalQuantity - used;
  if (quantity > remaining) {
    return {
      ok: false,
      reason: `Only ${remaining} ${item.name} remaining for this slot`,
      remaining,
      total: item.totalQuantity,
      requested: quantity,
    };
  }
  return { ok: true, remaining: remaining - quantity, total: item.totalQuantity, requested: quantity };
}

module.exports = {
  toMinutes,
  timesOverlap,
  sameCalendarDay,
  findVenueConflicts,
  suggestVenues,
  equipmentAvailability,
  BLOCKING,
};
