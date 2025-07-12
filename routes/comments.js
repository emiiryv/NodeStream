const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET yorumları getir
router.get('/videos/:id/comments', authMiddleware, async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT *, (user_id = $2) AS sahibi
       FROM comments
       WHERE video_id = $1
       ORDER BY tarih DESC`,
      [videoId, userId]
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


// DELETE yorum sil
router.delete('/videos/:videoId/comments/:commentId', authMiddleware, async (req, res) => {
  const { videoId, commentId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM comments WHERE id = $1 AND video_id = $2',
      [commentId, videoId]
    );
    const comment = result.rows[0];
    if (!comment) return res.status(404).json({ error: 'Yorum bulunamadı' });
    if (comment.user_id !== userId) return res.status(403).json({ error: 'Bu yorumu silemezsiniz' });

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    res.json({ message: 'Yorum silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yorum silinirken hata oluştu' });
  }
});

module.exports = router;