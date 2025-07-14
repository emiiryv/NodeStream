const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const commentController = require('../controllers/commentController');

const router = express.Router();

// GET yorumları getir
router.get('/videos/:id/comments', authMiddleware, commentController.getComments);

// POST yorum ekle
router.post('/videos/:id/comments', authMiddleware, commentController.addComment);

// DELETE yorum sil
router.delete('/videos/:videoId/comments/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;