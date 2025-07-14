const videoController = require('../controllers/videoController');
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', videoController.getAllVideos);
router.get('/mine', authMiddleware, videoController.getMyVideos);
router.delete('/:id', authMiddleware, videoController.deleteVideo);
router.post('/:id/like', authMiddleware, videoController.likeVideoToggle);
router.get('/:id/likes', authMiddleware, videoController.getVideoLikes);

const fs = require('fs');
const path = require('path');

router.post('/:id/view', videoController.incrementViewCount);
router.get('/:id/views', videoController.getViewCount);
router.put('/:id', authMiddleware, videoController.updateVideo);

module.exports = router;