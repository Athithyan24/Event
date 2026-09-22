const Event = require('../models/Event');
const Resource = require('../models/Resource');
const Allocation = require('../models/Allocation');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalAllocations = await Allocation.countDocuments();
    const alerts = await Resource.countDocuments({ status: { $in: ['Maintenance', 'Depleted'] } });

    // FIX 1: Sum the actual quantities of all resources instead of counting database rows
    const resourceAgg = await Resource.aggregate([
      { $group: { _id: null, totalUnits: { $sum: "$quantity" } } }
    ]);
    const totalResources = resourceAgg.length > 0 ? resourceAgg[0].totalUnits : 0;

    const recentAllocations = await Allocation.find()
      .sort({ _id: -1 })
      .limit(4)
      .populate('eventId', 'name')
      .populate('resourceId', 'name');

    // 12-Month Chart Data Initialization
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map(name => ({ name, events: 0, resources: 0 })); 

    // Calculate true event counts per month
    const allEvents = await Event.find({}, 'date');
    allEvents.forEach(ev => {
      if (ev.date) {
        const d = new Date(ev.date);
        if (!isNaN(d) && d.getMonth() >= 0 && d.getMonth() < 12) {
          chartData[d.getMonth()].events += 1;
        }
      }
    });

    // FIX 2: Calculate true resource allocation counts per month
    const allAllocations = await Allocation.find().populate('eventId', 'date');
    allAllocations.forEach(alloc => {
      // Check if the allocation is tied to an event with a valid date
      if (alloc.eventId && alloc.eventId.date) {
        const d = new Date(alloc.eventId.date);
        if (!isNaN(d) && d.getMonth() >= 0 && d.getMonth() < 12) {
          // Increment by 1 for each allocated resource, or by alloc.quantity if your schema supports it
          chartData[d.getMonth()].resources += 1; 
        }
      }
    });

    res.json({
      stats: { totalEvents, totalResources, totalAllocations, alerts },
      recentAllocations,
      chartData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};