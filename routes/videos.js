const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Tüm videolar (herkes görebilir)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY upload_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// 🔐 Giriş yapan kullanıcının videoları
router.get('/mine', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM videos WHERE uploaded_by = $1 ORDER BY upload_date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

const fs = require('fs');
const path = require('path');

// Silme route'u – sadece kendi videosunu silebilir
router.delete('/:id', authMiddleware, async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;

  try {
    const result = await pool.query('SELECT * FROM videos WHERE id = $1', [videoId]);
    const video = result.rows[0];

    if (!video) return res.status(404).json({ error: 'Video bulunamadı' });
    if (video.uploaded_by !== userId) return res.status(403).json({ error: 'Bu videoyu silemezsiniz' });

    const filePath = path.join(__dirname, '../uploads', video.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM videos WHERE id = $1', [videoId]);

    res.json({ message: 'Video başarıyla silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;

// POST like/unlike (toggle)
router.post('/:id/like', authMiddleware, async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      'SELECT * FROM likes WHERE video_id = $1 AND user_id = $2',
      [videoId, userId]
    );

    if (check.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE video_id = $1 AND user_id = $2', [videoId, userId]);
      res.json({ liked: false });
    } else {
      await pool.query('INSERT INTO likes (video_id, user_id) VALUES ($1, $2)', [videoId, userId]);
      res.json({ liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Beğeni işlemi başarısız' });
  }
});

// GET like count and user status
router.get('/:id/likes', authMiddleware, async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;

  try {
    const count = await pool.query('SELECT COUNT(*) FROM likes WHERE video_id = $1', [videoId]);
    const check = await pool.query('SELECT 1 FROM likes WHERE video_id = $1 AND user_id = $2', [videoId, userId]);

    res.json({
      totalLikes: parseInt(count.rows[0].count),
      likedByUser: check.rows.length > 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Beğeni bilgisi alınamadı' });
  }
});