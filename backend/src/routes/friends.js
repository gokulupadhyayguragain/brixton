const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Friend = require('../models/Friend');

const router = express.Router();

// Send friend request
router.post('/request', verifyToken, async (req, res) => {
  try {
    const recipientId = Number(req.body.recipient_id);

    if (!Number.isInteger(recipientId) || recipientId <= 0) {
      return res.status(400).json({ error: 'Recipient ID required' });
    }

    if (Number(req.userId) === recipientId) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    const requestId = await Friend.sendRequest(req.userId, recipientId);
    res.status(201).json({ message: 'Friend request sent', requestId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Request already exists' });
    }
    res.status(500).json({ error: 'Failed to send friend request', message: error.message });
  }
});

// Accept friend request
router.post('/accept', verifyToken, async (req, res) => {
  try {
    const requestId = Number(req.body.request_id);
    const success = await Friend.acceptRequest(requestId, req.userId);

    if (!success) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept request', message: error.message });
  }
});

// Reject friend request
router.post('/reject', verifyToken, async (req, res) => {
  try {
    const requestId = Number(req.body.request_id);
    const success = await Friend.rejectRequest(requestId, req.userId);

    if (!success) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request', message: error.message });
  }
});

// Get friends list
router.get('/list', verifyToken, async (req, res) => {
  try {
    const friends = await Friend.getFriends(req.userId);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch friends', message: error.message });
  }
});

// Get pending requests
router.get('/requests/pending', verifyToken, async (req, res) => {
  try {
    const requests = await Friend.getPendingRequests(req.userId);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests', message: error.message });
  }
});

// Remove friend
router.delete('/:friend_id', verifyToken, async (req, res) => {
  try {
    const success = await Friend.removeFriend(req.userId, req.params.friend_id);

    if (!success) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove friend', message: error.message });
  }
});

module.exports = router;
