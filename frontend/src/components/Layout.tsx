import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, Wallet, User as UserIcon, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={24} /> },
    { path: '/live', label: 'Live', icon: <Zap size={24} /> },
    { path: '/betslip', label: 'Bets', icon: <Receipt size={24} /> },
    { path: '/deposit', label: 'Deposit', icon: <Wallet size={24} /> },
    { path: '/account', label: 'Account', icon: <UserIcon size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-16 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-brand-black text-white p-3 sticky top-0 z-20 flex justify-between items-center border-b border-brand-green">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="ZimBet" className="w-8 h-8 rounded" />
          <span className="text-xl font-black tracking-tight text-white">ZIM<span className="text-brand-gold">BET</span></span>
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase leading-none">Balance</span>
              <span className="text-sm font-black text-brand-gold leading-none">${user?.balance.toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-xs bg-transparent border border-white px-3 py-1.5 rounded font-bold hover:bg-white hover:text-brand-black transition-colors">LOGIN</Link>
              <Link to="/register" className="text-xs bg-brand-gold text-brand-black px-3 py-1.5 rounded font-bold hover:bg-brand-gold/90 transition-all">JOIN</Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-black border-t border-gray-800 flex justify-around p-1 z-20">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 min-w-[64px] ${
              location.pathname === item.path ? 'text-brand-gold' : 'text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 uppercase font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
