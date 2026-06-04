import { useState, useEffect } from 'react';
import { Settings, LogOut, ChevronRight, History, CreditCard, ShieldCheck, ChevronLeft, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Bet } from '../types';

export default function Account() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'menu' | 'history'>('menu');
  const [bets, setBets] = useState<Bet[]>([]);
  const [loadingBets, setLoadingBets] = useState(false);

  useEffect(() => {
    if (view === 'history' && isAuthenticated) {
      const fetchBets = async () => {
        setLoadingBets(true);
        try {
          const data = await apiService.getMyBets();
          setBets(data);
        } catch (error) {
          console.error('Error fetching bets:', error);
        } finally {
          setLoadingBets(false);
        }
      };
      fetchBets();
    }
  }, [view, isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="p-10 text-center flex flex-col items-center gap-4">
        <p className="text-gray-500 font-bold">Please log in to view your account.</p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-brand-green text-white px-6 py-2 rounded-full font-black uppercase text-sm"
        >
          Login
        </button>
      </div>
    );
  }

  const menuItems = [
    { icon: <History size={20} />, label: 'Betting History', color: 'text-blue-500', action: () => setView('history') },
    { icon: <CreditCard size={20} />, label: 'Transaction History', color: 'text-green-500', action: () => {} },
    { icon: <ShieldCheck size={20} />, label: 'Security & Password', color: 'text-orange-500', action: () => {} },
    { icon: <Settings size={20} />, label: 'Account Settings', color: 'text-gray-500', action: () => {} },
  ];

  if (view === 'history') {
    return (
      <div className="flex flex-col min-h-[calc(100vh-120px)] bg-gray-50">
        <div className="bg-brand-black text-white p-4 pt-10 flex items-center gap-3">
          <button onClick={() => setView('menu')} className="p-1 -ml-1">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Betting History</h1>
        </div>

        <div className="flex-grow p-4">
          {loadingBets ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Fetching your bets...</p>
            </div>
          ) : bets.length > 0 ? (
            <div className="flex flex-col gap-4">
              {bets.map(bet => (
                <div key={bet.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-50">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Bet ID: {bet.id.substring(0, 8)}</p>
                      <p className="text-xs font-bold text-gray-600 mt-0.5">
                        {new Date(bet.created_at).toLocaleDateString()} at {new Date(bet.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      bet.status === 'won' ? 'bg-green-100 text-green-700' : 
                      bet.status === 'lost' ? 'bg-red-100 text-red-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {bet.status === 'won' ? <CheckCircle2 size={12} /> : 
                       bet.status === 'lost' ? <XCircle size={12} /> : 
                       <Clock size={12} />}
                      <span className="text-[10px] font-black uppercase tracking-wider">{bet.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {bet.legs?.map((leg, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-black text-brand-black">{leg.selection}</span>
                          <span className="text-xs font-black text-brand-green">{leg.odds.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{leg.home_team} vs {leg.away_team}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stake</span>
                      <span className="text-sm font-black text-brand-black">${bet.stake.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {bet.status === 'won' ? 'Total Payout' : 'Potential Payout'}
                      </span>
                      <span className={`text-lg font-black ${bet.status === 'won' ? 'text-green-600' : 'text-brand-green'}`}>
                        ${bet.potential_payout.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
              <History size={48} className="text-gray-200 mb-4" />
              <h3 className="font-black text-gray-800 uppercase">No Bets Found</h3>
              <p className="text-xs mt-1">You haven't placed any bets yet.</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-6 bg-brand-green text-white px-6 py-2 rounded-full font-black uppercase text-xs"
              >
                Place Your First Bet
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Header */}
      <div className="zimbet-gradient p-6 text-white pt-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center text-brand-black text-2xl font-black shadow-lg border-2 border-white/20 uppercase">
            {user?.username.substring(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-black">{user?.username}</h2>
            <p className="text-white/60 text-sm font-bold tracking-wide">{user?.phone_number}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-white/50 mb-1 tracking-wider">Total Balance</p>
            <p className="text-xl font-black text-brand-gold">${user?.balance.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-white/50 mb-1 tracking-wider">Bonus Balance</p>
            <p className="text-xl font-black text-white">$0.00</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={item.action}
              className={`w-full flex items-center justify-between p-4 ${idx !== menuItems.length - 1 ? 'border-b border-gray-50' : ''} active:bg-gray-50 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={`${item.color} bg-opacity-10 p-2 rounded-lg`}>{item.icon}</div>
                <span className="font-bold text-sm text-gray-700">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 mt-8 p-4 text-red-500 font-black uppercase text-sm border border-red-100 rounded-2xl bg-white shadow-sm active:bg-red-50 transition-colors"
        >
          <LogOut size={18} /> Log Out
        </button>
      </div>

      {/* Footer Info */}
      <div className="text-center py-6 px-10">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
          ZimBet - Licensed by the Lotteries and Gaming Board of Zimbabwe
        </p>
      </div>
    </div>
  )
}
