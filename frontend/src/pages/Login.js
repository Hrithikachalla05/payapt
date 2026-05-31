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
      const { data } = await API.post('/auth/login', {
        email: form.email,
        password: form.password,
      });

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
      const { data } = await API.post('/auth/verify-otp', {
        userId,
        otp: form.otp,
      });
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Pay<span className="text-blue-500">Apt</span></h1>
          <p className="text-gray-400 mt-2">India's leading trading platform</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {step === 1 ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Two-Factor Authentication</h2>
              <p className="text-gray-400 text-sm mb-6">Enter the 6-digit OTP sent to your email</p>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input
                  name="otp"
                  type="text"
                  value={form.otp}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  placeholder="_ _ _ _ _ _"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-gray-300 transition">
                  ← Back to login
                </button>
              </form>
            </>
          )}

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}