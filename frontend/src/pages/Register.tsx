import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiService.register({
        username: formData.username,
        phone_number: formData.phoneNumber,
        password: formData.password
      });
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Username or phone may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col min-h-[calc(100vh-120px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-black mb-2 uppercase italic tracking-tighter">Join ZimBet</h1>
        <p className="text-gray-500">Fast registration. Instant deposits.</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4 flex-grow">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-bold border border-red-100">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Username</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="e.g. lucky_zim" 
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Phone Number</label>
          <div className="relative">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="tel" 
              placeholder="+263 7..." 
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Create Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-2">
          By joining, you agree to ZimBet's Terms of Service and Privacy Policy. You must be 18+ to play.
        </p>

        <button 
          type="submit"
          disabled={loading}
          className="bg-brand-gold text-brand-black rounded-xl py-4 font-black flex items-center justify-center gap-2 mt-4 shadow-lg shadow-brand-gold/20 active:scale-[0.98] transition-transform uppercase disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'} <ArrowRight size={18} />
        </button>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">Already a member?</p>
          <Link to="/login" className="text-brand-green font-black uppercase text-sm mt-1 block">Sign In</Link>
        </div>
      </form>
    </div>
  )
}
