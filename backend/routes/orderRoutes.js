const express = require('express');
const router = express.Router();
const { placeOrder, getOrderHistory, getPortfolio } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/place', protect, placeOrder);
router.get('/history', protect, getOrderHistory);
router.get('/portfolio', protect, getPortfolio);

module.exports = router;