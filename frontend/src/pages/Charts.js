/* eslint-disable */
import { useEffect, useRef, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const SYMBOLS = [
  { label: 'Reliance', value: 'BSE:RELIANCE' },
  { label: 'TCS', value: 'BSE:TCS' },
  { label: 'Infosys', value: 'BSE:INFY' },
  { label: 'HDFC Bank', value: 'BSE:HDFCBANK' },
  { label: 'Wipro', value: 'BSE:WIPRO' },
  { label: 'Bajaj Finance', value: 'BSE:BAJFINANCE' },
  { label: 'SBI', value: 'BSE:SBIN' },
  { label: 'Tata Motors', value: 'BSE:TATAMOTORS' },
];

export default function Charts() {
  const chartRef = useRef(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BSE:RELIANCE');
  const [interval, setIntervalVal] = useState('D');
  const [alerts, setAlerts] = useState([]);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertSymbol, setAlertSymbol] = useState('RELIANCE.BSE');
  const [orderModal, setOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ type: 'BUY', quantity: 1, price: '', orderType: 'MARKET' });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    // Load TradingView widget
    if (chartRef.current) {
      chartRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      script.textContent = JSON.stringify({
        autosize: true,
        symbol: selectedSymbol,
        interval: interval,
        timezone: 'Asia/Kolkata',
        theme: 'dark',
        style: '1',
        locale: 'en',
        enable_publishing: false,
        allow_symbol_change: true,
        calendar: false,
        support_host: 'https://www.tradingview.com',
      });
      chartRef.current.appendChild(script);
    }
  }, [selectedSymbol, interval]);

  const addAlert = () => {
    if (!alertPrice) return toast.error('Enter a price for the alert');
    const newAlert = {
      id: Date.now(),
      symbol: alertSymbol,
      price: parseFloat(alertPrice),
      createdAt: new Date().toLocaleString(),
    };
    setAlerts([...alerts, newAlert]);
    setAlertPrice('');
    toast.success(`Alert set for ${alertSymbol} at ₹${alertPrice}`);
  };

  const removeAlert = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id));
    toast.success('Alert removed');
  };

  const placeOrder = async () => {
    if (!orderForm.price || !orderForm.quantity) return toast.error('Fill all fields');
    setPlacing(true);
    try {
      await API.post('/orders/place', {
        symbol: alertSymbol,
        type: orderForm.type,
        quantity: parseInt(orderForm.quantity),
        price: parseFloat(orderForm.price),
        orderType: orderForm.orderType,
      });
      toast.success(`${orderForm.type} ${orderForm.orderType} order placed!`);
      setOrderModal(false);
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
        <h1 className="text-xl font-bold">Pay<span className="text-blue-500">Apt</span> — Charts</h1>
        <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition">← Dashboard</a>
      </nav>

      <div className="flex h-screen">
        {/* Left — Chart */}
        <div className="flex-1 flex flex-col">
          {/* Symbol selector */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex gap-2 flex-wrap">
            {SYMBOLS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSelectedSymbol(s.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  selectedSymbol === s.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Interval selector */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex gap-2">
            {['1', '5', '15', '60', 'D', 'W'].map((i) => (
              <button
                key={i}
                onClick={() => setIntervalVal(i)}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  interval === i ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {i === '1' ? '1m' : i === '5' ? '5m' : i === '15' ? '15m' : i === '60' ? '1h' : i === 'D' ? '1D' : '1W'}
              </button>
            ))}
            <button
              onClick={() => setOrderModal(true)}
              className="ml-auto bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-1 rounded-lg transition"
            >
              + Place Order
            </button>
          </div>

          {/* TradingView Chart */}
          <div className="tradingview-widget-container flex-1" ref={chartRef} style={{ height: '100%' }}>
            <div className="tradingview-widget-container__widget" style={{ height: '100%' }}></div>
          </div>
        </div>

        {/* Right Panel — Alerts */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-semibold mb-3">🔔 Price Alerts</h3>
            <select
              value={alertSymbol}
              onChange={(e) => setAlertSymbol(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none"
            >
              {SYMBOLS.map((s) => (
                <option key={s.value} value={s.label.toUpperCase().replace(' ', '') + '.BSE'}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="Target price ₹"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addAlert}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition"
              >
                Set
              </button>
            </div>
          </div>

          {/* Alert list */}
          <div className="flex-1 overflow-y-auto p-4">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-8">No alerts set</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="bg-gray-800 rounded-lg p-3 mb-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{alert.symbol}</p>
                    <p className="text-blue-400 font-bold">₹{alert.price}</p>
                    <p className="text-gray-500 text-xs">{alert.createdAt}</p>
                  </div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-red-400 hover:text-red-300 text-xs transition"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Place Order</h3>

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
                <label className="text-gray-400 text-sm block mb-1">Order Type</label>
                <select
                  value={orderForm.orderType}
                  onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MARKET">Market Order</option>
                  <option value="LIMIT">Limit Order</option>
                  <option value="SL">Stop Loss</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                  placeholder="Enter price"
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
              {orderForm.price && orderForm.quantity && (
                <div className="bg-gray-800 rounded-lg px-4 py-3">
                  <p className="text-gray-400 text-sm">Total Value</p>
                  <p className="text-white font-bold text-lg">₹{(orderForm.price * orderForm.quantity).toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setOrderModal(false)}
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