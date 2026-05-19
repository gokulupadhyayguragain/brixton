const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Chat = require('../models/Chat');

const router = express.Router();

// Send message
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { recipient_id, content } = req.body;

    if (!recipient_id || !content) {
      return res.status(400).json({ error: 'Recipient ID and content required' });
    }

    const messageId = await Chat.createMessage(req.userId, recipient_id, content);
    res.status(201).json({ message: 'Message sent', messageId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message', message: error.message });
  }
});

// Get conversation
router.get('/conversation/:friend_id', verifyToken, async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const messages = await Chat.getConversation(req.userId, req.params.friend_id, limit);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation', message: error.message });
  }
});

// Mark messages as read
router.post('/mark-read', verifyToken, async (req, res) => {
  try {
    const { message_ids } = req.body;

    if (!Array.isArray(message_ids)) {
      return res.status(400).json({ error: 'Message IDs must be an array' });
    }

    await Chat.markAsRead(message_ids);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark messages', message: error.message });
  }
});

// Get unread count
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const unreadCounts = await Chat.getUnreadCount(req.userId);
    res.json(unreadCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count', message: error.message });
  }
});

// Get recent chats
router.get('/recent', verifyToken, async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const chats = await Chat.getRecentChats(req.userId, limit);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats', message: error.message });
  }
});

module.exports = router;
