

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users/:id - Kullanıcı profil bilgilerini getir
router.get('/:id', userController.getUserProfile);

module.exports = router;