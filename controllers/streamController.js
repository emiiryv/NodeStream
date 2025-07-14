

const fs = require('fs');
const path = require('path');

exports.streamVideo = (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, '..', 'uploads', filename);

  fs.stat(videoPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).send('Video bulunamadı');
    }

    const range = req.headers.range;
    if (!range) {
      return res.status(416).send('Range header gerekli');
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const videoSize = stats.size;

    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);
    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
  });
};