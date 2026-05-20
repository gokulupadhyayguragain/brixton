const db = require('../config/database');

class User {
  static async create(userData) {
    const { username, email, password_hash, full_name, latitude, longitude } = userData;
    const query = `
      INSERT INTO users (username, email, password_hash, full_name, latitude, longitude, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.execute(query, [
      username,
      email,
      password_hash,
      full_name,
      latitude || 0,
      longitude || 0
    ]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, username, email, full_name, latitude, longitude, created_at FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async updateLocation(userId, latitude, longitude) {
    const query = 'UPDATE users SET latitude = ?, longitude = ? WHERE id = ?';
    const [result] = await db.execute(query, [latitude, longitude, userId]);
    return result.affectedRows > 0;
  }

  static async searchUsers(searchTerm, currentUserId, limit = 20) {
    const query = `
      SELECT u.id, u.username, u.email, u.full_name, u.latitude, u.longitude
      FROM users u
      WHERE (u.username LIKE ? OR u.full_name LIKE ?)
        AND u.id <> ?
        AND NOT EXISTS (
          SELECT 1
          FROM friendships f
          WHERE f.user_id = ? AND f.friend_id = u.id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM friend_requests fr
          WHERE (
            (fr.sender_id = ? AND fr.recipient_id = u.id)
            OR
            (fr.sender_id = u.id AND fr.recipient_id = ?)
          )
          AND fr.status = 'pending'
        )
      LIMIT ?
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.execute(query, [
      searchPattern,
      searchPattern,
      currentUserId,
      currentUserId,
      currentUserId,
      currentUserId,
      limit
    ]);
    return rows;
  }
}

module.exports = User;
