const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const uploadRoutes = require('./routes/upload');
const videoRoutes = require('./routes/videos');
const streamRoutes = require('./routes/stream');
const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // HTML dosyaları
app.use('/thumbnails', express.static(path.join(__dirname, 'thumbnails')));

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', commentRoutes);

// Server başlat
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});