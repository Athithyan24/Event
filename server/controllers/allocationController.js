const Allocation = require('../models/Allocation');
const Resource = require('../models/Resource');

exports.allocateResource = async (req, res) => {
  try {
    const { eventId, resourceId, quantity } = req.body;
    
    // Check if already allocated to this event
    const existing = await Allocation.findOne({ eventId, resourceId });
    if (existing) {
      return res.status(400).json({ message: "Resource already allocated to this event." });
    }

    // Check availability (simplified for demo: total quantity vs all active allocations)
    const resource = await Resource.findById(resourceId);
    const activeAllocations = await Allocation.find({ resourceId, status: 'Confirmed' });
    const currentlyUsed = activeAllocations.reduce((acc, curr) => acc + curr.quantityAllocated, 0);

    if (currentlyUsed + quantity > resource.totalQuantity) {
      return res.status(400).json({ message: "Insufficient resource quantity available." });
    }

    const allocation = new Allocation({ eventId, resourceId, quantityAllocated: quantity });
    await allocation.save();
    
    res.status(201).json(allocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};