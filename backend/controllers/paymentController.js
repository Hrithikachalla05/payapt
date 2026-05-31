const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Add funds to user account
    const user = await User.findById(req.user._id);
    user.funds.availableCash += amount;
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'Payment successful! Funds added.',
      availableCash: user.funds.availableCash,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/payments/withdraw
const withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);

    if (user.funds.availableCash < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.funds.availableCash -= amount;
    await user.save({ validateBeforeSave: false });

    res.json({
      message: `₹${amount} withdrawn successfully`,
      availableCash: user.funds.availableCash,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment, withdrawFunds };