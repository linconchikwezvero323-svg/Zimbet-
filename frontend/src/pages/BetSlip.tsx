import { Trash2, Plus, Minus, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBetSlip } from '../context/BetContext';
import { useNavigate } from 'react-router-dom';

export default function BetSlip() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { selections, removeSelection, clearSlip } = useBetSlip();
  const navigate = useNavigate();
  const [stake, setStake] = useState('10');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const totalOdds = selections.reduce((acc, curr) => acc * curr.odds, 1);
  const potentialPayout = parseFloat(stake) * totalOdds;

  const handlePlaceBet = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await apiService.placeBet({
        stake: parseFloat(stake),
        legs: selections.map(s => ({ outcome_id: s.outcome_id }))
      });
      setStatus('success');
      clearSlip();
      refreshUser(); // Update balance
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="p-10 text-center flex flex-col items-center gap-4">
        <CheckCircle2 size={64} className="text-brand-green" />
        <h2 className="text-2xl font-black uppercase">Bet Placed!</h2>
        <p className="text-gray-500">Good luck! You can view your active bets in your account history.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-brand-black text-white px-8 py-3 rounded-xl font-black uppercase mt-4"
        >
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-gray-50">
      <div className="bg-brand-black text-white p-4 pt-10">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Your Bet Slip</h1>
        <p className="text-brand-gold text-xs font-black mt-1 uppercase tracking-widest">{selections.length} SELECTIONS</p>
      </div>

      <div className="flex-grow p-4">
        {selections.length > 0 ? (
          <div className="flex flex-col gap-3">
            {selections.map(sel => (
              <div key={sel.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
                <button 
                  onClick={() => removeSelection(sel.id)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="pr-8">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase text-brand-green tracking-wider">{sel.market}</span>
                  </div>
                  <h3 className="font-black text-brand-black">{sel.selection}</h3>
                  <p className="text-xs text-gray-400 font-medium">{sel.homeTeam} vs {sel.awayTeam}</p>
                  <div className="mt-2 bg-brand-gold/10 inline-block px-2 py-0.5 rounded text-brand-black font-black text-xs">
                    {sel.odds.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 p-3 text-xs font-black uppercase text-brand-green border-2 border-dashed border-brand-green/30 rounded-xl mt-2"
            >
              <Plus size={16} /> Add More Matches
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
            <p>Your bet slip is empty.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 bg-brand-green text-white px-6 py-2 rounded-full font-black uppercase text-xs"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>

      {selections.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-xs font-black uppercase text-gray-500 tracking-wider">Stake Amount</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStake(Math.max(1, parseInt(stake) - 5).toString())}
                  className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100"
                >
                  <Minus size={14} />
                </button>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">$</span>
                  <input 
                    type="number" 
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="bg-transparent border-b-2 border-brand-green w-16 py-1 pl-4 pr-1 text-center font-black text-brand-black focus:outline-none"
                  />
                </div>
                <button 
                  onClick={() => setStake((parseInt(stake) + 5).toString())}
                  className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2 px-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-widest">Total Odds</span>
                <span className="font-black text-brand-black">{totalOdds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">Bonus <Info size={10} /></span>
                <span className="font-black text-brand-green">+ $0.00</span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                <span className="text-sm font-black uppercase tracking-tighter text-gray-800">Potential Payout</span>
                <span className="text-2xl font-black text-brand-green">${potentialPayout.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceBet}
              disabled={loading || selections.length === 0}
              className="bg-brand-green text-white rounded-xl py-4 font-black mt-2 shadow-lg shadow-brand-green/20 active:scale-[0.98] transition-transform uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : isAuthenticated ? 'Place Bet' : 'Login to Bet'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
