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

  static async searchUsers(searchTerm, limit = 20) {
    const query = `
      SELECT id, username, email, full_name, latitude, longitude 
      FROM users 
      WHERE username LIKE ? OR full_name LIKE ? 
      LIMIT ?
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.execute(query, [searchPattern, searchPattern, limit]);
    return rows;
  }
}

module.exports = User;
