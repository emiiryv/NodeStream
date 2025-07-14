const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const followController = require('../controllers/followController');

// Giriş yapmış kullanıcının bilgilerini getir
router.get('/me', authMiddleware, userController.getCurrentUser);

// GET /api/users/:id - Kullanıcı profil bilgilerini getir
router.get('/:id', userController.getUserProfile);

// Takip et
router.post('/:id/follow', authMiddleware, followController.followUser);

// Takibi bırak
router.delete('/:id/follow', authMiddleware, followController.unfollowUser);

// Takip durumu
router.get('/:id/follow', authMiddleware, followController.checkFollowStatus);

// ✅ Takipçi listesini getir
router.get('/:id/followers', userController.getFollowers);

// ✅ Takip edilenleri getir
router.get('/:id/following', userController.getFollowing);

module.exports = router;