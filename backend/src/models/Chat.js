const db = require('../config/database');

class Chat {
  static async createMessage(senderId, recipientId, content) {
    const query = `
      INSERT INTO messages (sender_id, recipient_id, content, created_at, is_read)
      VALUES (?, ?, ?, NOW(), FALSE)
    `;
    const [result] = await db.execute(query, [senderId, recipientId, content]);
    return result.insertId;
  }

  static async getConversation(userId, friendId, limit = 50) {
    const query = `
      SELECT id, sender_id, recipient_id, content, created_at, is_read
      FROM messages
      WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
      ORDER BY created_at DESC
      LIMIT ?
    `;
    const [rows] = await db.execute(query, [userId, friendId, friendId, userId, limit]);
    return rows.reverse();
  }

  static async markAsRead(messageIds) {
    if (messageIds.length === 0) return true;
    const placeholders = messageIds.map(() => '?').join(',');
    const query = `UPDATE messages SET is_read = TRUE WHERE id IN (${placeholders})`;
    const [result] = await db.execute(query, messageIds);
    return result.affectedRows > 0;
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT sender_id, COUNT(*) as unread_count
      FROM messages
      WHERE recipient_id = ? AND is_read = FALSE
      GROUP BY sender_id
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async getRecentChats(userId, limit = 20) {
    const query = `
      SELECT DISTINCT
        CASE 
          WHEN sender_id = ? THEN recipient_id 
          ELSE sender_id 
        END as friend_id,
        u.username,
        u.full_name,
        MAX(m.created_at) as last_message_time,
        (SELECT content FROM messages 
         WHERE (sender_id = ? AND recipient_id = friend_id) 
            OR (sender_id = friend_id AND recipient_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message
      FROM messages m
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = ? THEN u.id = m.recipient_id 
          ELSE u.id = m.sender_id 
        END
      )
      WHERE m.sender_id = ? OR m.recipient_id = ?
      GROUP BY friend_id
      ORDER BY last_message_time DESC
      LIMIT ?
    `;
    const [rows] = await db.execute(query, [userId, userId, userId, userId, userId, userId, limit]);
    return rows;
  }
}

module.exports = Chat;
