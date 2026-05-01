import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

export default function AccountSettings() {
  const { user, userData, updateEmail, updatePassword } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateEmail(email);
      setMessage({ type: 'success', text: 'Email update request sent! Please check your new email for confirmation.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }
    setLoading(true);
    try {
      await updatePassword(newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  return (
    <PageLayout showBackButton={true}>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${
            message.type === 'success' 
            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
            : 'bg-primary-magenta/10 text-primary-magenta border-primary-magenta/20'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Email Update Section */}
          <div className="bg-card-dark p-8 rounded-2xl shadow-xl border border-white/5">
            <div className="flex items-center space-x-3 mb-6">
              <Mail className="h-6 w-6 text-primary-purple" />
              <h2 className="text-xl font-bold">Account Information</h2>
            </div>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary-purple/50 outline-none transition-all"
                  required
                />
              </div>
              <button 
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-primary-purple/10 text-primary-purple px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-primary-purple/20 transition-all disabled:opacity-50 border border-primary-purple/20"
              >
                <Save className="h-4 w-4" />
                <span>Update Email</span>
              </button>
            </form>
          </div>

          {/* Password Update Section */}
          <div className="bg-card-dark p-8 rounded-2xl shadow-xl border border-white/5">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="h-6 w-6 text-primary-magenta" />
              <h2 className="text-xl font-bold">Security Settings</h2>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary-purple/50 outline-none transition-all"
                  placeholder="At least 6 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary-purple/50 outline-none transition-all"
                  required
                />
              </div>
              <button 
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-primary-magenta/10 text-primary-magenta px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-primary-magenta/20 transition-all disabled:opacity-50 border border-primary-magenta/20"
              >
                <Save className="h-4 w-4" />
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
