const mongoose = require('mongoose');
const Allocation = require('../models/Allocation');
const Resource = require('../models/Resource');
const Event = require('../models/Event');

exports.getAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('eventId', 'name date')
      .populate('resourceId', 'name category totalQuantity status')
      // Sort so 'Confirmed' (active) comes before 'Returned', then by newest
      .sort({ status: 1, createdAt: -1 });

    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.allocateResource = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, resourceId, quantityAllocated = 1 } = req.body;

    if (!eventId || !resourceId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Event ID and Resource ID are required.' });
    }

    if (quantityAllocated < 1 || !Number.isInteger(Number(quantityAllocated))) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Quantity must be a positive integer.' });
    }

    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Event not found.' });
    }

    const resource = await Resource.findById(resourceId).session(session);
    if (!resource) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (resource.status === 'Maintenance' || resource.status === 'Depleted') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: `Cannot allocate resource. Status is ${resource.status}.` });
    }

    const existing = await Allocation.findOne({ eventId, resourceId, status: 'Confirmed' }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Resource is already actively allocated to this event.' });
    }

    const activeAllocations = await Allocation.aggregate([
      { $match: { resourceId: new mongoose.Types.ObjectId(resourceId), status: 'Confirmed' } },
      { $group: { _id: null, totalAllocated: { $sum: '$quantityAllocated' } } }
    ]).session(session);

    const currentlyUsed = activeAllocations.length > 0 ? activeAllocations[0].totalAllocated : 0;
    const available = resource.totalQuantity - currentlyUsed;

    if (quantityAllocated > available) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `Insufficient inventory. Only ${Math.max(0, available)} unit(s) available.` 
      });
    }

    const allocation = new Allocation({
      eventId,
      resourceId,
      quantityAllocated,
      status: 'Confirmed'
    });

    await allocation.save({ session });
    await session.commitTransaction();
    session.endSession();

    await allocation.populate('eventId', 'name date');
    await allocation.populate('resourceId', 'name category totalQuantity');

    res.status(201).json(allocation);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

exports.returnAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found.' });
    }
    
    if (allocation.status === 'Returned') {
      return res.status(400).json({ message: 'This allocation has already been returned.' });
    }

    allocation.status = 'Returned';
    await allocation.save();

    res.json({ message: 'Resource returned successfully.', allocation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndDelete(req.params.id);
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found.' });
    }
    res.json({ message: 'Allocation permanently deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};