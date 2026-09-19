const Allocation = require('../models/Allocation');
const Resource = require('../models/Resource');

// 1. ADD THIS FUNCTION to handle GET /api/allocations
exports.getAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find();
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. UPDATE THIS FUNCTION to match the frontend payload
exports.allocateResource = async (req, res) => {
  try {
    // Changed 'quantity' to 'quantityAllocated' to match frontend
    const { eventId, resourceId, quantityAllocated } = req.body;
    const quantity = quantityAllocated || 1;
    
    // Check if already allocated to this event
    const existing = await Allocation.findOne({ eventId, resourceId });
    if (existing) {
      return res.status(400).json({ message: "Resource already allocated to this event." });
    }

    // Check availability
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