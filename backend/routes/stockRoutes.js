const express = require('express');
const router = express.Router();
const { getQuote, getMarketWatch } = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

router.get('/market-watch', protect, getMarketWatch);
router.get('/quote/:symbol', protect, getQuote);

module.exports = router;