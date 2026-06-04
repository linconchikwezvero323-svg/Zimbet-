import { useState } from 'react';
import { Smartphone, CheckCircle2, History, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const METHODS = [
  { id: 'ecocash', name: 'EcoCash', color: 'bg-[#003B5C]' },
  { id: 'innbucks', name: 'InnBucks', color: 'bg-[#EC1C24]' },
];

export default function Withdraw() {
  const { user, refreshUser } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('ecocash');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleWithdraw = async () => {
    if (!amount || !phone) return;
    setLoading(true);
    setStatus('idle');
    try {
      await apiService.withdraw({
        amount: parseFloat(amount),
        method: selectedMethod,
        phone_number: phone
      });
      setStatus('success');
      setAmount('');
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
        <h2 className="text-2xl font-black uppercase">Withdrawal Sent!</h2>
        <p className="text-gray-500">Your withdrawal request has been received. Funds will be sent to your mobile wallet shortly after processing.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="bg-brand-black text-white px-8 py-3 rounded-xl font-black uppercase mt-4"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-brand-black uppercase italic tracking-tighter">Withdraw</h1>
          <p className="text-sm text-gray-500">Fast payouts to your mobile wallet.</p>
        </div>
        <button className="bg-white p-2 rounded-lg text-brand-green shadow-sm border border-gray-100">
          <History size={20} />
        </button>
      </div>

      <div className="bg-brand-black p-4 rounded-xl text-white shadow-lg">
        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Available for Withdrawal</p>
        <p className="text-3xl font-black text-brand-gold">${user?.balance.toFixed(2)}</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Select Payout Method</label>
        <div className="grid grid-cols-2 gap-3">
          {METHODS.map(method => (
            <button 
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                selectedMethod === method.id 
                ? 'border-brand-green bg-white shadow-md' 
                : 'border-transparent bg-white opacity-60'
              }`}
            >
              {selectedMethod === method.id && (
                <CheckCircle2 className="absolute top-2 right-2 text-brand-green" size={16} />
              )}
              <div className={`w-12 h-12 rounded-lg ${method.color} mb-2 flex items-center justify-center text-white font-bold text-[10px]`}>
                {method.name}
              </div>
              <span className="text-xs font-black uppercase">{method.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Withdrawal Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
            <input 
              type="number" 
              placeholder="Min $2.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-8 pr-4 font-black text-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green shadow-sm"
            />
          </div>
          <button 
            onClick={() => setAmount(user?.balance.toFixed(2) || '0.00')}
            className="text-xs font-bold text-brand-green mt-1 ml-1"
          >
            Withdraw Maximum
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{selectedMethod === 'ecocash' ? 'EcoCash' : 'InnBucks'} Number</label>
          <div className="relative">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="tel" 
              placeholder="+263 7..." 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green shadow-sm"
            />
          </div>
        </div>

        <button 
          onClick={handleWithdraw}
          disabled={loading || !amount || !phone}
          className="bg-brand-black text-white rounded-xl py-4 font-black mt-4 shadow-lg active:scale-[0.98] transition-transform uppercase tracking-widest border border-brand-green disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Withdrawal'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl">
        <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 tracking-wider">Helpful Information</p>
        <ul className="text-[10px] text-gray-400 space-y-1 list-disc ml-3 font-medium">
          <li>Withdrawals are processed within 30 minutes.</li>
          <li>EcoCash withdrawals incur a $0.50 provider fee.</li>
          <li>Ensure the phone number matches your registered wallet.</li>
        </ul>
      </div>
    </div>
  )
}
