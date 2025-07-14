const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

exports.streamVideo = (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, '..', 'uploads', filename);
  const mimeType = mime.lookup(videoPath) || 'application/octet-stream';

  fs.stat(videoPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).send('Video bulunamadı');
    }

    const range = req.headers.range;
    const videoSize = stats.size;

    if (!range) {
      const headers = {
        'Content-Length': videoSize,
        'Content-Type': mimeType,
      };
      res.writeHead(200, headers);
      fs.createReadStream(videoPath).pipe(res);
      return;
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': mimeType,
    };

    res.writeHead(206, headers);
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  });
};