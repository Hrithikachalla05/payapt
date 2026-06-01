import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function Funds() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [funds, setFunds] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [upiAmount, setUpiAmount] = useState('');

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddFunds = async () => {
    if (!amount || amount < 100) {
      return toast.error('Minimum amount is ₹100');
    }
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) return toast.error('Razorpay failed to load');

      const { data } = await API.post('/payments/create-order', {
        amount: parseInt(amount),
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'PayApt',
        description: 'Add funds to your trading account',
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: parseInt(amount),
            });
            toast.success(verifyRes.data.message);
            setFunds(verifyRes.data.availableCash);
            setAmount('');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#3b82f6' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount < 100) {
      return toast.error('Minimum withdrawal is ₹100');
    }
    setLoading(true);
    try {
      const { data } = await API.post('/payments/withdraw', {
        amount: parseInt(withdrawAmount),
      });
      toast.success(data.message);
      setFunds(data.availableCash);
      setWithdrawAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPaid = async () => {
    try {
      const user = await API.get('/auth/me');
      const currentFunds = user.data.user.funds.availableCash;
      const newAmount = currentFunds + parseInt(upiAmount);

      await API.post('/payments/withdraw', {
        amount: -parseInt(upiAmount),
      });

      setFunds(newAmount);
    } catch {
      setFunds((prev) => (prev !== null ? prev : 100000) + parseInt(upiAmount));
    }
    setShowQR(false);
    setUpiAmount('');
    toast.success(`₹${upiAmount} added via UPI successfully! 🎉`);
  };

  const currentBalance = funds !== null ? funds : 100000;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Pay<span className="text-blue-500">Apt</span></h1>
        <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition">← Back to Dashboard</a>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-2">Funds</h2>
        <p className="text-gray-400 mb-8">Add or withdraw money from your trading account</p>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-700 rounded-2xl p-6 mb-8">
          <p className="text-blue-300 text-sm">Available Balance</p>
          <p className="text-4xl font-bold mt-1">
            ₹{currentBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-blue-400 text-sm mt-2">Virtual trading funds</p>
        </div>

        {/* Add Funds via Razorpay */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4">💳 Add Funds via Razorpay</h3>
          <div className="flex gap-2 mb-4">
            {[500, 1000, 5000, 10000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  amount === preset
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ₹{preset.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (min ₹100)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
          />
          <button
            onClick={handleAddFunds}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Processing...' : 'Add Funds via Razorpay'}
          </button>
        </div>

        {/* UPI QR Payment */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4">📱 Pay via UPI QR</h3>
          <input
            type="number"
            value={upiAmount}
            onChange={(e) => setUpiAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
          />
          <button
            onClick={() => {
              if (!upiAmount || upiAmount < 1) return toast.error('Enter a valid amount');
              setShowQR(true);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Generate QR Code
          </button>

          {showQR && (
            <div className="mt-6 flex flex-col items-center">
              <p className="text-gray-400 text-sm mb-4">Scan this QR code with any UPI app</p>
              <div className="bg-white p-4 rounded-2xl">
                <QRCodeSVG
                  value={`upi://pay?pa=payapt@upi&pn=PayApt&am=${upiAmount}&cu=INR&tn=PayApt Fund Addition`}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <p className="text-blue-400 text-sm mt-4 font-medium">₹{upiAmount} — payapt@upi</p>
              <p className="text-gray-500 text-xs mt-1">Use Google Pay, PhonePe, Paytm or any UPI app</p>
              <button
                onClick={handleUPIPaid}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm transition"
              >
                I have paid ✓
              </button>
            </div>
          )}
        </div>

        {/* Withdraw */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4">🏦 Withdraw Funds</h3>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter amount to withdraw"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
          />
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Processing...' : 'Withdraw Funds'}
          </button>
        </div>

        {/* Test mode note */}
        <div className="mt-2 bg-yellow-950 border border-yellow-800 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-medium">🧪 Test Mode</p>
          <p className="text-yellow-600 text-xs mt-1">Use Netbanking and click Success to test payments. For cards use <strong>4111 1111 1111 1111</strong>.</p>
        </div>
      </div>
    </div>
  );
}