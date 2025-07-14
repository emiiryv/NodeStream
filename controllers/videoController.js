

const pool = require('../db');

exports.updateVideo = async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;
  const { originalname, description } = req.body;

  try {
    const check = await pool.query(
      'SELECT * FROM videos WHERE id = $1 AND uploaded_by = $2',
      [videoId, userId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Bu videoyu düzenleyemezsiniz' });
    }

    await pool.query(
      'UPDATE videos SET originalname = $1, description = $2 WHERE id = $3',
      [originalname, description, videoId]
    );

    res.json({ message: 'Video güncellendi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Video güncellenemedi' });
  }
};
exports.getAllVideos = async (req, res) => {
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
  }

  try {
    const result = await pool.query(baseQuery, [`%${search}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

exports.getMyVideos = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM videos WHERE uploaded_by = $1 ORDER BY upload_date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Videolar alınamadı' });
  }
};

exports.deleteVideo = async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;
  try {
    const check = await pool.query('SELECT * FROM videos WHERE id = $1 AND uploaded_by = $2', [videoId, userId]);
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Bu videoyu silemezsiniz' });
    }

    await pool.query('DELETE FROM videos WHERE id = $1', [videoId]);
    res.json({ message: 'Video silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Silme işlemi başarısız' });
  }
};

exports.likeVideoToggle = async (req, res) => {
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
};

exports.getVideoLikes = async (req, res) => {
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
};