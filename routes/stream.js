const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  // Dosya var mı kontrol et
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Dosya bulunamadı');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Parselere Range header (örnek: "bytes=0-")
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Range Not Satisfiable');
      return;
    }

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4' // MOV yerine HTML5 uyumluluğu için mp4 stream denenebilir
    });

    file.pipe(res);
  } else {
    // Range header yoksa tüm dosyayı gönder
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    });

    fs.createReadStream(filePath).pipe(res);
  }
});

module.exports = router;