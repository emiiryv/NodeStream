exports.getCurrentUser = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const pool = require('../db');

exports.getUserProfile = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, username, bio, joined_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Kullanıcı profili alınırken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

exports.getFollowers = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.username
       FROM users u
       JOIN followers f ON u.id = f.follower_id
       WHERE f.following_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Takipçiler alınırken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

exports.getFollowing = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.username
       FROM users u
       JOIN followers f ON u.id = f.following_id
       WHERE f.follower_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Takip edilenler alınırken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};