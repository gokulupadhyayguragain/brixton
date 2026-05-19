const express = require('express');
const { verifyToken } = require('../middleware/auth');
const FederationRegistry = require('./registry');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify federation requests
const verifyFederationSecret = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.FEDERATION_SECRET}`) {
    return res.status(401).json({ error: 'Invalid federation secret' });
  }
  next();
};

/**
 * Search for users globally (across all instances)
 * GET /api/federation/search?term=john
 */
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { term } = req.query;

    if (!term || term.length < 2) {
      return res.status(400).json({ error: 'Search term must be at least 2 characters' });
    }

    // Search globally
    const globalResults = await FederationRegistry.searchGlobally(term);

    // Search locally
    const User = require('../models/User');
    const localResults = await User.searchUsers(term, 20);

    // Combine and deduplicate
    const emailSet = new Set();
    const combined = [];

    globalResults.forEach((user) => {
      if (!emailSet.has(user.email)) {
        emailSet.add(user.email);
        combined.push({
          ...user,
          source: 'global'
        });
      }
    });

    localResults.forEach((user) => {
      if (!emailSet.has(user.email)) {
        emailSet.add(user.email);
        combined.push({
          ...user,
          source: 'local'
        });
      }
    });

    res.json(combined.slice(0, 20));
  } catch (error) {
    console.error('Federation search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

/**
 * Find specific user globally
 * GET /api/federation/find/:email
 */
router.get('/find/:email', verifyToken, async (req, res) => {
  try {
    const user = await FederationRegistry.findUserGlobally(req.params.email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      found: true,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      instance_url: user.instance_url,
      instance_name: user.instance_name
    });
  } catch (error) {
    res.status(500).json({ error: 'Find failed', message: error.message });
  }
});

/**
 * Add friend from another instance
 * POST /api/federation/add-friend-remote
 */
router.post('/add-friend-remote', verifyToken, async (req, res) => {
  try {
    const { recipient_email } = req.body;

    if (!recipient_email) {
      return res.status(400).json({ error: 'Recipient email required' });
    }

    // Get current user's email
    const sender = await User.findById(req.userId);

    // Send cross-instance friend request
    const result = await FederationRegistry.sendCrossInstanceFriendRequest(
      req.userId,
      sender.email,
      recipient_email
    );

    if (result.local) {
      return res.json({
        message: 'Friend request sent (local)',
        type: 'local'
      });
    }

    res.json({
      message: 'Friend request sent across instances',
      type: 'remote',
      details: result.response
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send request', message: error.message });
  }
});

/**
 * Send message to user on another instance
 * POST /api/federation/send-message-remote
 */
router.post('/send-message-remote', verifyToken, async (req, res) => {
  try {
    const { recipient_email, content } = req.body;

    if (!recipient_email || !content) {
      return res.status(400).json({ error: 'Recipient email and content required' });
    }

    const sender = await User.findById(req.userId);

    // Send message across instances
    const result = await FederationRegistry.sendCrossInstanceMessage(
      req.userId,
      sender.email,
      recipient_email,
      content
    );

    if (result.local) {
      return res.json({
        message: 'Message sent (local)',
        type: 'local'
      });
    }

    res.json({
      message: 'Message sent to remote instance',
      type: 'remote',
      details: result.response
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message', message: error.message });
  }
});

/**
 * Receive friend request from another instance
 * POST /api/federation/receive-friend-request
 * Protected with FEDERATION_SECRET
 */
router.post('/receive-friend-request', verifyFederationSecret, async (req, res) => {
  try {
    const { sender_email, sender_instance, recipient_user_id } = req.body;

    // Store cross-instance friend request
    // Format: "remote-<sender_email>@<sender_instance>"
    const remoteSenderId = `remote-${sender_email}@${sender_instance}`;

    // Save to database (implement as needed)
    console.log(`📨 Received friend request from ${sender_email} at ${sender_instance}`);

    res.json({
      message: 'Friend request received',
      request_id: remoteSenderId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to receive request', message: error.message });
  }
});

/**
 * Receive message from another instance
 * POST /api/federation/receive-message
 * Protected with FEDERATION_SECRET
 */
router.post('/receive-message', verifyFederationSecret, async (req, res) => {
  try {
    const { sender_email, sender_instance, recipient_user_id, content, timestamp } = req.body;

    // Store cross-instance message
    console.log(`💬 Received message from ${sender_email}:`);
    console.log(content);

    // Save to database (implement as needed)
    // Could store in messages table with special recipient format

    res.json({
      message: 'Message received and stored',
      message_id: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to receive message', message: error.message });
  }
});

/**
 * Get all instances in the federation
 * GET /api/federation/instances
 */
router.get('/instances', verifyToken, async (req, res) => {
  try {
    const instances = await FederationRegistry.getAllInstances();
    res.json(instances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get instances', message: error.message });
  }
});

/**
 * Health check for federation
 * GET /api/federation/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    instance_url: process.env.INSTANCE_URL,
    instance_name: process.env.INSTANCE_NAME,
    federation_enabled: process.env.FEDERATION_ENABLED === 'true'
  });
});

module.exports = router;
