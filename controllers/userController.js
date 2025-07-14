

const pool = require('../db');

exports.getUserProfile = async (req, res) => {
  const userId = req.params.id;

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