import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', otp: '' });
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email: form.email, password: form.password });
      if (data.requires2FA) {
        setUserId(data.userId);
        setStep(2);
        toast.success('OTP sent to your email!');
      } else {
        login(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/verify-otp', { userId, otp: form.otp });
      login(data.token, data.user);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex-col justify-between p-12">
        <div>
          <h1 className="text-4xl font-bold text-white">Pay<span className="text-blue-300">Apt</span></h1>
          <p className="text-blue-200 mt-2 text-sm">India's Smart Trading Platform</p>
        </div>
        <div className="space-y-8">
          {[
            { icon: '📈', title: 'Live Market Data', desc: 'Real-time BSE/NSE stock prices' },
            { icon: '💳', title: 'Instant Payments', desc: 'Razorpay & UPI integration' },
            { icon: '📊', title: 'Advanced Charts', desc: 'TradingView candlestick charts' },
            { icon: '🔒', title: 'Bank-grade Security', desc: 'JWT auth with 2FA protection' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-700 bg-opacity-50 rounded-xl flex items-center justify-center text-2xl">{f.icon}</div>
              <div>
                <p className="text-white font-semibold">{f.title}</p>
                <p className="text-blue-300 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-blue-400 text-xs">© 2024 PayApt. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Pay<span className="text-blue-500">Apt</span></h1>
            <p className="text-gray-400 mt-1 text-sm">India's Smart Trading Platform</p>
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-gray-400 text-sm mb-8">Sign in to your trading account</p>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Email Address</label>
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-gray-400 text-xs uppercase tracking-wider">Password</label>
                    <span className="text-blue-400 text-xs cursor-pointer hover:text-blue-300">Forgot password?</span>
                  </div>
                  <input
                    name="password" type="password" value={form.password} onChange={handleChange} required
                    placeholder="••••••••"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                  {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Signing in...</> : 'Sign In →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-600 bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl mb-6">🔐</div>
              <h2 className="text-2xl font-bold text-white mb-1">Verify Identity</h2>
              <p className="text-gray-400 text-sm mb-8">Enter the 6-digit OTP sent to your email</p>
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <input
                  name="otp" type="text" value={form.otp} onChange={handleChange} required maxLength={6}
                  placeholder="_ _ _ _ _ _"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-white text-center text-3xl tracking-widest placeholder-gray-700 focus:outline-none focus:border-blue-500 transition"
                />
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition">
                  {loading ? 'Verifying...' : 'Verify & Continue →'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-gray-300 transition">← Back to login</button>
              </form>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              New to PayApt?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create account →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}