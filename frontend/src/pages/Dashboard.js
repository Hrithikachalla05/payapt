import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState({ holdings: [], availableCash: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('market');
  const [orderModal, setOrderModal] = useState(null);
  const [orderForm, setOrderForm] = useState({ type: 'BUY', quantity: 1, price: 0 });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [stockRes, portfolioRes, orderRes] = await Promise.all([
        API.get('/stocks/market-watch'),
        API.get('/orders/portfolio'),
        API.get('/orders/history'),
      ]);
      setStocks(stockRes.data);
      setPortfolio(portfolioRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openOrderModal = (stock) => {
    setOrderModal(stock);
    setOrderForm({ type: 'BUY', quantity: 1, price: stock.price });
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await API.post('/orders/place', {
        symbol: orderModal.symbol,
        type: orderForm.type,
        quantity: parseInt(orderForm.quantity),
        price: orderForm.price,
      });
      toast.success(`${orderForm.type} order placed!`);
      setOrderModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Pay<span className="text-blue-500">Apt</span></h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Welcome, {user?.name}</span>
          <span className="text-green-400 font-semibold">₹{portfolio.availableCash?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
<a href="/funds" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">Add Funds</a>
<a href="/charts" className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition">📈 Charts</a>
          <button onClick={logout} className="text-gray-400 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6">
        {['market', 'portfolio', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize transition border-b-2 mr-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'market' ? 'Market Watch' : tab === 'portfolio' ? 'Portfolio' : 'Order History'}
          </button>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center text-blue-400 animate-pulse mt-20">Loading market data...</div>
        ) : (
          <>
            {/* Market Watch */}
            {activeTab === 'market' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Live Market Watch</h2>
                {stocks.length === 0 ? (
                  <div className="text-gray-500 text-center mt-20">
                    <p>No data available right now.</p>
                    <p className="text-sm mt-2">Alpha Vantage free tier has limited calls. Try again in a minute.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {stocks.map((stock) => (
                      <div key={stock.symbol} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{stock.symbol}</p>
                          <p className="text-2xl font-bold mt-1">₹{stock.price?.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)} ({stock.changePercent})
                          </p>
                          <button
                            onClick={() => openOrderModal(stock)}
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
                          >
                            Trade
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Portfolio */}
            {activeTab === 'portfolio' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Your Holdings</h2>
                {portfolio.holdings.length === 0 ? (
                  <div className="text-gray-500 text-center mt-20">No holdings yet. Start trading!</div>
                ) : (
                  <div className="grid gap-4">
                    {portfolio.holdings.map((h) => (
                      <div key={h.symbol} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{h.symbol}</p>
                          <p className="text-gray-400 text-sm">Avg Price: ₹{h.avgPrice?.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{h.quantity} shares</p>
                          <p className="text-gray-400 text-sm">Value: ₹{(h.quantity * h.avgPrice).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order History */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-gray-500 text-center mt-20">No orders yet.</div>
                ) : (
                  <div className="grid gap-3">
                    {orders.map((o) => (
                      <div key={o._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{o.symbol}</p>
                          <p className="text-gray-400 text-sm">{new Date(o.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold px-3 py-1 rounded-full ${o.type === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                            {o.type}
                          </span>
                          <p className="text-gray-400 text-sm mt-1">{o.quantity} × ₹{o.price?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Place Order — {orderModal.symbol}</h3>

            <div className="flex gap-2 mb-4">
              {['BUY', 'SELL'].map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderForm({ ...orderForm, type: t })}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    orderForm.type === t
                      ? t === 'BUY' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Quantity</label>
                <input
                  type="number"
                  value={orderForm.quantity}
                  min={1}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="bg-gray-800 rounded-lg px-4 py-3">
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-white font-bold text-lg">₹{(orderForm.price * orderForm.quantity).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setOrderModal(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={placeOrder}
                disabled={placing}
                className={`flex-1 py-3 rounded-lg font-semibold transition disabled:opacity-50 ${
                  orderForm.type === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {placing ? 'Placing...' : `${orderForm.type} Now`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}