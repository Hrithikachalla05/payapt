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
  { symbol: 'ADANIENT.BSE', price: 2456.75, change: 34.50, changePercent: '1.42%' },
  { symbol: 'HINDUNILVR.BSE', price: 2234.60, change: -12.40, changePercent: '-0.55%' },
  { symbol: 'ICICIBANK.BSE', price: 1123.45, change: 9.80, changePercent: '0.88%' },
  { symbol: 'KOTAKBANK.BSE', price: 1876.30, change: -6.50, changePercent: '-0.35%' },
  { symbol: 'AXISBANK.BSE', price: 1045.20, change: 14.30, changePercent: '1.39%' },
  { symbol: 'MARUTI.BSE', price: 10234.50, change: 123.40, changePercent: '1.22%' },
  { symbol: 'SUNPHARMA.BSE', price: 1567.80, change: -8.60, changePercent: '-0.55%' },
  { symbol: 'ONGC.BSE', price: 267.45, change: 3.20, changePercent: '1.21%' },
  { symbol: 'NTPC.BSE', price: 356.70, change: -2.10, changePercent: '-0.59%' },
  { symbol: 'POWERGRID.BSE', price: 298.45, change: 4.50, changePercent: '1.53%' },
  { symbol: 'ULTRACEMCO.BSE', price: 9876.30, change: -45.60, changePercent: '-0.46%' },
  { symbol: 'ASIANPAINT.BSE', price: 2987.65, change: 23.40, changePercent: '0.79%' },
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
    return res.json(mockStocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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