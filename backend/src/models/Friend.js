const db = require('../config/database');

class Friend {
  static async sendRequest(senderId, recipientId) {
    const query = `
      INSERT INTO friend_requests (sender_id, recipient_id, status, created_at)
      VALUES (?, ?, 'pending', NOW())
    `;
    const [result] = await db.execute(query, [senderId, recipientId]);
    return result.insertId;
  }

  static async acceptRequest(requestId) {
    const [request] = await db.execute(
      'SELECT sender_id, recipient_id FROM friend_requests WHERE id = ?',
      [requestId]
    );

    if (!request.length) return false;

    const { sender_id, recipient_id } = request[0];

    // Create bidirectional friendship
    await db.execute(
      'INSERT INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, NOW())',
      [sender_id, recipient_id]
    );
    await db.execute(
      'INSERT INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, NOW())',
      [recipient_id, sender_id]
    );

    // Update request status
    await db.execute(
      'UPDATE friend_requests SET status = ? WHERE id = ?',
      ['accepted', requestId]
    );

    return true;
  }

  static async rejectRequest(requestId) {
    const query = 'UPDATE friend_requests SET status = ? WHERE id = ?';
    const [result] = await db.execute(query, ['rejected', requestId]);
    return result.affectedRows > 0;
  }

  static async getFriends(userId) {
    const query = `
      SELECT u.id, u.username, u.email, u.full_name, u.latitude, u.longitude
      FROM friendships f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ?
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async getPendingRequests(userId) {
    const query = `
      SELECT fr.id, u.id as sender_id, u.username, u.email, u.full_name, fr.created_at
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.recipient_id = ? AND fr.status = 'pending'
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async isFriend(userId, friendId) {
    const query = 'SELECT id FROM friendships WHERE user_id = ? AND friend_id = ?';
    const [rows] = await db.execute(query, [userId, friendId]);
    return rows.length > 0;
  }

  static async removeFriend(userId, friendId) {
    const query = 'DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)';
    const [result] = await db.execute(query, [userId, friendId, friendId, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = Friend;
