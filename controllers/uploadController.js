const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
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

    const videoPath = path.join(__dirname, '..', 'uploads', filename);
    const thumbName = filename + '.jpg';
    const thumbnailPath = path.join(__dirname, '..', 'thumbnails', thumbName);

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .on('end', () => resolve())
          .on('error', (err) => {
            console.error('Thumbnail üretilemedi:', err.message);
            resolve(); // hata olsa bile devam et
          })
          .screenshots({
            timestamps: ['1'],
            filename: thumbName,
            folder: path.join(__dirname, '..', 'thumbnails'),
            size: '320x240'
          });
      });
    } catch (thumbErr) {
      console.error('Thumbnail oluşturma sırasında hata:', thumbErr.message);
    }

    res.status(201).json({
      message: 'Dosya başarıyla yüklendi.',
      video: {
        ...result.rows[0],
        thumbnail_path: thumbName
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

module.exports = { handleUpload };