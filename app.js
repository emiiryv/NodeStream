const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const uploadRoutes = require('./routes/upload');
const videoRoutes = require('./routes/videos');
const streamRoutes = require('./routes/stream');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // HTML dosyaları

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/stream', streamRoutes);

// Server başlat
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});