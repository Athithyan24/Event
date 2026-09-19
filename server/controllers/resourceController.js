const Resource = require('../models/Resource');

exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

exports.createResource = async (req, res) => {
  try {
    const newResource = new Resource(req.body);
    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    res.status(500).json({ message: 'Error creating resource', error: error.message });
  }
};