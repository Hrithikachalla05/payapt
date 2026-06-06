import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
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
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.newPassword === form.currentPassword) return toast.error('New password must be different');
    setLoading(true);
    try {
      await API.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Pay<span className="text-blue-500">Apt</span></h1>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-1">Change Password</h2>
          <p className="text-gray-400 text-sm mb-6">Keep your account secure with a strong password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Current Password</label>
              <input name="currentPassword" type="password" value={form.currentPassword}
                onChange={handleChange} required placeholder="Enter current password"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">New Password</label>
              <input name="newPassword" type="password" value={form.newPassword}
                onChange={handleChange} required placeholder="Min. 6 characters"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className={`text-xs font-medium ${getPasswordStrength(form.newPassword)?.text}`}>
                      {getPasswordStrength(form.newPassword)?.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${getPasswordStrength(form.newPassword)?.color} ${getPasswordStrength(form.newPassword)?.width}`}></div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Confirm New Password</label>
              <input name="confirm" type="password" value={form.confirm}
                onChange={handleChange} required placeholder="Re-enter new password"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Changing...</> : 'Change Password →'}
            </button>
          </form>

          <button onClick={() => navigate('/dashboard')} className="w-full mt-4 text-gray-500 text-sm hover:text-gray-300 transition">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}