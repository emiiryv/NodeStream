const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Tüm videolar (herkes görebilir)
router.get('/', async (req, res) => {
  const { search = '', sort = 'date' } = req.query;

  let baseQuery = `
    SELECT v.*, COUNT(l.id) AS like_count
    FROM videos v
    LEFT JOIN likes l ON v.id = l.video_id
    WHERE v.originalname ILIKE $1 OR v.filename ILIKE $1
    GROUP BY v.id
  `;

  if (sort === 'likes') {
    baseQuery += ' ORDER BY like_count DESC';
  } else if (sort === 'popular') {
    baseQuery = `
      SELECT v.*, COUNT(DISTINCT l.id) AS like_count, COUNT(DISTINCT c.id) AS comment_count
      FROM videos v
      LEFT JOIN likes l ON v.id = l.video_id
      LEFT JOIN comments c ON v.id = c.video_id
      WHERE v.originalname ILIKE $1 OR v.filename ILIKE $1
      GROUP BY v.id
      ORDER BY (COUNT(DISTINCT l.id) + COUNT(DISTINCT c.id)) DESC
    `;
  } else if (sort === 'date_asc') {
    baseQuery += ' ORDER BY v.upload_date ASC';
  } else if (sort === 'date_desc' || sort === 'date') {
    baseQuery += ' ORDER BY v.upload_date DESC';
  } else {
    baseQuery += ' ORDER BY v.upload_date DESC';
  }

  try {
    const result = await pool.query(baseQuery, [`%${search}%`]);
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