const path = require('path');
const pool = require('../db/index');

const handleUpload = async (req, res) => {
  if (!req.file || !req.user) {
    return res.status(400).json({ error: 'Dosya veya kullanıcı bilgisi eksik.' });
  }

  const { originalname, filename, mimetype, size } = req.file;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `INSERT INTO videos (filename, originalname, mimetype, size, uploaded_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [filename, originalname, mimetype, size, userId]
    );

    res.status(201).json({
      message: 'Dosya başarıyla yüklendi.',
      video: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

module.exports = { handleUpload };