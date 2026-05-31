const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  symbol: String,
  quantity: Number,
  avgPrice: Number,
});

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  holdings: [holdingSchema],
});

module.exports = mongoose.model('Portfolio', portfolioSchema);