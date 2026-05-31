const Order = require('../models/Order');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');

// @route POST /api/orders/place
const placeOrder = async (req, res) => {
  try {
    const { symbol, type, quantity, price } = req.body;
    const total = quantity * price;

    const user = await User.findById(req.user._id);

    if (type === 'BUY') {
      // Check if user has enough funds
      if (user.funds.availableCash < total) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
      // Deduct funds
      user.funds.availableCash -= total;
      await user.save({ validateBeforeSave: false });

      // Update portfolio
      let portfolio = await Portfolio.findOne({ user: req.user._id });
      if (!portfolio) {
        portfolio = new Portfolio({ user: req.user._id, holdings: [] });
      }

      const existing = portfolio.holdings.find((h) => h.symbol === symbol);
      if (existing) {
        // Update average price
        const totalQty = existing.quantity + quantity;
        existing.avgPrice = (existing.avgPrice * existing.quantity + price * quantity) / totalQty;
        existing.quantity = totalQty;
      } else {
        portfolio.holdings.push({ symbol, quantity, avgPrice: price });
      }
      await portfolio.save();
    }

    if (type === 'SELL') {
      // Check if user has enough holdings
      const portfolio = await Portfolio.findOne({ user: req.user._id });
      const holding = portfolio?.holdings.find((h) => h.symbol === symbol);

      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient holdings' });
      }

      // Update holdings
      holding.quantity -= quantity;
      if (holding.quantity === 0) {
        portfolio.holdings = portfolio.holdings.filter((h) => h.symbol !== symbol);
      }
      await portfolio.save();

      // Add funds
      user.funds.availableCash += total;
      await user.save({ validateBeforeSave: false });
    }

    // Create order record
    const order = await Order.create({
      user: req.user._id,
      symbol,
      type,
      quantity,
      price,
      total,
    });

    res.status(201).json({ message: `${type} order placed successfully`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/history
const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/portfolio
const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);
    res.json({
      holdings: portfolio?.holdings || [],
      availableCash: user.funds.availableCash,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { placeOrder, getOrderHistory, getPortfolio };