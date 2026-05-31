const axios = require('axios');

const mockStocks = [
  { symbol: 'RELIANCE.BSE', price: 2945.50, change: 23.40, changePercent: '0.80%' },
  { symbol: 'TCS.BSE', price: 3876.25, change: -15.30, changePercent: '-0.39%' },
  { symbol: 'INFY.BSE', price: 1543.80, change: 12.60, changePercent: '0.82%' },
  { symbol: 'HDFCBANK.BSE', price: 1678.45, change: -8.90, changePercent: '-0.53%' },
  { symbol: 'WIPRO.BSE', price: 456.70, change: 5.20, changePercent: '1.15%' },
  { symbol: 'BAJFINANCE.BSE', price: 7123.30, change: 45.80, changePercent: '0.65%' },
  { symbol: 'SBIN.BSE', price: 623.45, change: -3.20, changePercent: '-0.51%' },
  { symbol: 'TATAMOTORS.BSE', price: 945.60, change: 18.70, changePercent: '2.02%' },
];

const getQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { data } = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
    );
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      return res.status(404).json({ message: 'Symbol not found' });
    }
    res.json({
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: quote['06. volume'],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMarketWatch = async (req, res) => {
  try {
    const symbols = ['RELIANCE.BSE', 'TCS.BSE', 'INFY.BSE', 'HDFCBANK.BSE', 'WIPRO.BSE'];
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const { data } = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
          );
          const quote = data['Global Quote'];
          if (!quote || !quote['05. price']) return null;
          return {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent'],
          };
        } catch {
          return null;
        }
      })
    );
    const validQuotes = quotes.filter(Boolean);
    if (validQuotes.length === 0) {
      return res.json(mockStocks);
    }
    res.json(validQuotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuote, getMarketWatch };