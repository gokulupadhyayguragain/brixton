const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Update location (for map feature)
router.post('/update-location', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const success = await User.updateLocation(req.userId, latitude, longitude);
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location', message: error.message });
  }
});

// Search users
router.get('/search/:term', verifyToken, async (req, res) => {
  try {
    const { term } = req.params;
    if (term.length < 2) {
      return res.status(400).json({ error: 'Search term must be at least 2 characters' });
    }

    const users = await User.searchUsers(term, req.userId, 20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// Get user profile
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

module.exports = router;
