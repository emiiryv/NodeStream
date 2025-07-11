const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET yorumları getir
router.get('/videos/:id/comments', authMiddleware, async (req, res) => {
  const videoId = req.params.id;
  try {
    const result = await pool.query(
      'SELECT yorum, tarih FROM comments WHERE video_id = $1 ORDER BY tarih DESC',
      [videoId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yorumları getirme hatası' });
  }
});

// POST yorum ekle
router.post('/videos/:id/comments', authMiddleware, async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;
  const { yorum } = req.body;

  if (!yorum || yorum.trim() === '') {
    return res.status(400).json({ error: 'Yorum boş olamaz' });
  }

  try {
    await pool.query(
      'INSERT INTO comments (video_id, user_id, yorum) VALUES ($1, $2, $3)',
      [videoId, userId, yorum.trim()]
    );
    res.status(201).json({ message: 'Yorum eklendi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yorum ekleme hatası' });
  }
});

module.exports = router;