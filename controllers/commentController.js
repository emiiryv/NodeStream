

const pool = require('../db');

exports.getComments = async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT id, yorum, tarih, user_id, parent_comment_id, 
              (user_id = $2) AS sahibi
       FROM comments
       WHERE video_id = $1
       ORDER BY tarih ASC`,
      [videoId, userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yorumları getirme hatası' });
  }
};

exports.addComment = async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;
  const { yorum, parent_comment_id } = req.body;

  if (!yorum || yorum.trim() === '') {
    return res.status(400).json({ error: 'Yorum boş olamaz' });
  }

  try {
    await pool.query(
      'INSERT INTO comments (video_id, user_id, yorum, parent_comment_id) VALUES ($1, $2, $3, $4)',
      [videoId, userId, yorum.trim(), parent_comment_id || null]
    );
    res.status(201).json({ message: 'Yorum eklendi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yorum ekleme hatası' });
  }
};

exports.deleteComment = async (req, res) => {
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
};