const express = require('express');
const fs = require('fs');
const path = require('path');
const streamController = require('../controllers/streamController');

const router = express.Router();

router.get('/:filename', streamController.streamVideo);

module.exports = router;