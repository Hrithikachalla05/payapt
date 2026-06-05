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
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

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
      toast.success(`${orderForm.type} order placed successfully!`);
      setOrderModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  const totalPortfolioValue = portfolio.holdings.reduce((sum, h) => sum + h.quantity * h.avgPrice, 0);
  const filteredStocks = stocks.filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()));
useEffect(() => {
  if (stocks.length === 0) return;
  const interval = setInterval(() => {
    setStocks(prev => prev.map(stock => {
      const change = (Math.random() - 0.48) * stock.price * 0.002;
      const newPrice = parseFloat((stock.price + change).toFixed(2));
      const newChange = parseFloat((stock.change + change).toFixed(2));
      return { ...stock, price: newPrice, change: newChange };
    }));
  }, 3000);
  return () => clearInterval(interval);
}, []); // empty dependency array [stocks.length]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold">Pay<span className="text-blue-500">Apt</span></h1>
          <div className="hidden md:flex gap-1">
            {['market', 'portfolio', 'orders'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                {tab === 'market' ? '📊 Market' : tab === 'portfolio' ? '💼 Portfolio' : '📋 Orders'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-500">Available Balance</p>
            <p className="text-green-400 font-bold">₹{portfolio.availableCash?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </div>
          <a href="/funds" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition font-medium">+ Add Funds</a>
          <a href="/charts" className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 rounded-lg transition font-medium">📈 Charts</a>
          <div className="relative group">
  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer">
    {user?.name?.charAt(0).toUpperCase()}
  </div>
  <div className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-xl p-3 w-48 hidden group-hover:block z-50">
    <p className="text-white text-sm font-medium">{user?.name}</p>
    <p className="text-gray-400 text-xs mb-2">{user?.email}</p>
    {user?.lastLogin && (
      <p className="text-gray-500 text-xs mb-3">Last login: {new Date(user.lastLogin).toLocaleString()}</p>
    )}
    <button onClick={logout} className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 rounded-lg transition">
      Logout
    </button>
  </div>
</div>
      {/* Stats Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Available Cash', value: `₹${portfolio.availableCash?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-green-400' },
          { label: 'Portfolio Value', value: `₹${totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-blue-400' },
          { label: 'Total Holdings', value: `${portfolio.holdings.length} stocks`, color: 'text-yellow-400' },
          { label: 'Total Orders', value: `${orders.length} orders`, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-32 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Loading market data...</p>
          </div>
        ) : (
          <>
            {/* Market Watch */}
            {activeTab === 'market' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Live Market Watch</h2>
                  <input
                    type="text" placeholder="🔍 Search stocks..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 w-48"
                  />
                </div>
                {filteredStocks.length === 0 ? (
                  <div className="text-center mt-20 text-gray-500">
                    <p className="text-4xl mb-4">📊</p>
                    <p>No stocks found. Try again in a minute.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStocks.map((stock) => (
                      <div key={stock.symbol} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-sm">{stock.symbol.replace('.BSE', '')}</p>
                            <p className="text-gray-500 text-xs">BSE</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${stock.change >= 0 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                            {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)?.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-2xl font-bold mb-1">₹{stock.price?.toFixed(2)}</p>
                        <p className={`text-sm mb-4 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.changePercent}
                        </p>
                        <button onClick={() => openOrderModal(stock)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-xl transition font-medium">
                          Trade Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Portfolio */}
            {activeTab === 'portfolio' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Your Portfolio</h2>
                {portfolio.holdings.length === 0 ? (
                  <div className="text-center mt-20">
                    <p className="text-4xl mb-4">💼</p>
                    <p className="text-gray-400">No holdings yet.</p>
                    <button onClick={() => setActiveTab('market')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm transition">
                      Start Trading →
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {portfolio.holdings.map((h) => (
                      <div key={h.symbol} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex justify-between items-center">
                        <div>
                          <p className="font-bold">{h.symbol.replace('.BSE', '')}</p>
                          <p className="text-gray-400 text-sm">Avg: ₹{h.avgPrice?.toFixed(2)} · {h.quantity} shares</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-400">₹{(h.quantity * h.avgPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                          <p className="text-gray-500 text-xs">Total Value</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center mt-20">
                    <p className="text-4xl mb-4">📋</p>
                    <p className="text-gray-400">No orders yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {orders.map((o) => (
                      <div key={o._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${o.type === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                            {o.type === 'BUY' ? 'B' : 'S'}
                          </span>
                          <div>
                            <p className="font-semibold">{o.symbol.replace('.BSE', '')}</p>
                            <p className="text-gray-500 text-xs">{new Date(o.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{o.total?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                          <p className="text-gray-500 text-xs">{o.quantity} × ₹{o.price?.toFixed(2)}</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold">{orderModal.symbol.replace('.BSE', '')}</h3>
                <p className="text-gray-400 text-sm">₹{orderModal.price?.toFixed(2)}</p>
              </div>
              <button onClick={() => setOrderModal(null)} className="text-gray-500 hover:text-white text-2xl transition">×</button>
            </div>

            <div className="flex gap-2 mb-5">
              {['BUY', 'SELL'].map((t) => (
                <button key={t} onClick={() => setOrderForm({ ...orderForm, type: t })}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition ${orderForm.type === t ? (t === 'BUY' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-gray-800 text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Price (₹)</label>
                <input type="number" value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Quantity</label>
                <input type="number" value={orderForm.quantity} min={1}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="bg-gray-800 rounded-xl p-4 flex justify-between">
                <span className="text-gray-400">Total Value</span>
                <span className="font-bold text-lg">₹{(orderForm.price * orderForm.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <button onClick={placeOrder} disabled={placing}
              className={`w-full mt-5 py-3.5 rounded-xl font-bold transition disabled:opacity-50 ${orderForm.type === 'BUY' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} text-white`}>
              {placing ? 'Placing...' : `${orderForm.type} ${orderModal.symbol.replace('.BSE', '')}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}