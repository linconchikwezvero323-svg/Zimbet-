import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col min-h-[calc(100vh-120px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-black mb-2 uppercase italic tracking-tighter">Welcome Back</h1>
        <p className="text-gray-500">Sign in to your ZimBet account to start betting.</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4 flex-grow">
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
              placeholder="lucky_zim" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
          <div className="flex justify-end mt-1">
            <button type="button" className="text-xs font-bold text-brand-green">Forgot Password?</button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="bg-brand-green text-white rounded-xl py-4 font-black flex items-center justify-center gap-2 mt-4 shadow-lg shadow-brand-green/20 active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'LOGIN'} <ArrowRight size={18} />
        </button>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">Don't have an account?</p>
          <Link to="/register" className="text-brand-green font-black uppercase text-sm mt-1 block">Join ZimBet Today</Link>
        </div>
      </form>

      <div className="text-center mt-auto py-4">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Zimbabwe's #1 Betting Platform</p>
      </div>
    </div>
  )
}
