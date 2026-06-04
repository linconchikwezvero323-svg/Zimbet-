import { useState } from 'react';
import { Smartphone, CheckCircle2, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const METHODS = [
  { id: 'ecocash', name: 'EcoCash', color: 'bg-[#003B5C]', logo: 'https://placehold.co/100x100?text=EcoCash' },
  { id: 'innbucks', name: 'InnBucks', color: 'bg-[#EC1C24]', logo: 'https://placehold.co/100x100?text=InnBucks' },
];

export default function Deposit() {
  const { user, refreshUser } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('ecocash');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDeposit = async () => {
    if (!amount || !phone) return;
    setLoading(true);
    setStatus('idle');
    try {
      await apiService.deposit({
        amount: parseFloat(amount),
        method: selectedMethod,
        phone_number: phone
      });
      setStatus('success');
      setAmount('');
      // The backend simulates a 10s delay, so we refresh after that
      setTimeout(refreshUser, 11000);
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
        <h2 className="text-2xl font-black uppercase">Request Sent!</h2>
        <p className="text-gray-500">Please check your phone for the PIN prompt. Your balance will update automatically within 10 seconds.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="bg-brand-black text-white px-8 py-3 rounded-xl font-black uppercase mt-4"
        >
          Make Another Deposit
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-brand-black uppercase italic tracking-tighter">Deposit Funds</h1>
        <p className="text-sm text-gray-500">Fast and secure mobile money deposits.</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Select Method</label>
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
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
            <input 
              type="number" 
              placeholder="Min $1.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-8 pr-4 font-black text-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green shadow-sm"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[5, 10, 20, 50].map(val => (
              <button 
                key={val} 
                onClick={() => setAmount(val.toString())}
                className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 active:bg-brand-green active:text-white transition-colors"
              >
                +${val}
              </button>
            ))}
          </div>
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
          onClick={handleDeposit}
          disabled={loading || !amount || !phone}
          className="bg-brand-green text-white rounded-xl py-4 font-black mt-4 shadow-lg shadow-brand-green/20 active:scale-[0.98] transition-transform uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Initiate Deposit'}
        </button>
      </div>

      <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-xl">
        <p className="text-xs text-brand-black/70 font-medium">
          <span className="font-bold">Note:</span> After clicking, you will receive a prompt on your phone to enter your PIN. Funds will be added instantly upon approval.
        </p>
      </div>
    </div>
  )
}
