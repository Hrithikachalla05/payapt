import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3', text: 'text-red-400' };
    if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return { label: 'Medium', color: 'bg-yellow-500', width: 'w-2/3', text: 'text-yellow-400' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full', text: 'text-green-400' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      login(data.token, data.user);
      toast.success('Account created! Welcome to PayApt 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <div className="bg-blue-800 bg-opacity-40 rounded-2xl p-8 border border-blue-700">
          <p className="text-blue-200 text-sm uppercase tracking-wider mb-4">New Account Bonus</p>
          <p className="text-5xl font-bold text-white mb-2">₹1,00,000</p>
          <p className="text-blue-300">Virtual funds credited instantly to your account to start practice trading with zero risk.</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Stocks Available', value: '5000+' },
              { label: 'Exchanges', value: 'BSE & NSE' },
              { label: 'Order Types', value: 'Market, Limit, SL' },
              { label: 'Payment Methods', value: 'UPI, Cards' },
            ].map((s) => (
              <div key={s.label} className="bg-blue-900 bg-opacity-50 rounded-xl p-3">
                <p className="text-white font-bold">{s.value}</p>
                <p className="text-blue-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-400 text-xs">© 2024 PayApt. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Pay<span className="text-blue-500">Apt</span></h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-gray-400 text-sm mb-8">Start trading with ₹1,00,000 virtual funds</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Rahul Sharma' },
              { label: 'Email Address', name: 'email', type: 'email', placeholder: 'rahul@example.com' },
              { label: 'Confirm Password', name: 'confirm', type: 'password', placeholder: 'Re-enter password' },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">{field.label}</label>
                <input
                  name={field.name} type={field.type} value={form[field.name]}
                  onChange={handleChange} required placeholder={field.placeholder}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            ))}

            {/* Password with strength meter */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Password</label>
              <input
                name="password" type="password" value={form.password}
                onChange={handleChange} required placeholder="Min. 6 characters"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              {form.password && (
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className={`text-xs font-medium ${getPasswordStrength(form.password)?.text}`}>
                      {getPasswordStrength(form.password)?.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${getPasswordStrength(form.password)?.color} ${getPasswordStrength(form.password)?.width}`}></div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Use uppercase, numbers for a stronger password</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Creating account...</> : 'Create Account →'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-950 border border-blue-900 rounded-xl flex items-start gap-3">
            <span className="text-lg">🔒</span>
            <p className="text-blue-300 text-xs">Your data is protected with JWT authentication and optional 2-factor verification. We never store plain text passwords.</p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}