import React from 'react';
import { useBetSlip } from '../context/BetContext';

interface MatchCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  league: string;
  odds: {
    home: { id: string; value: number };
    draw: { id: string; value: number };
    away: { id: string; value: number };
  };
}

const MatchCard: React.FC<MatchCardProps> = ({ id, homeTeam, awayTeam, time, league, odds }) => {
  const { addSelection, selections } = useBetSlip();

  const handleSelect = (selectionName: string, outcomeId: string, oddsValue: number) => {
    addSelection({
      id: `${id}-${outcomeId}`,
      outcome_id: outcomeId,
      homeTeam,
      awayTeam,
      market: '1X2',
      selection: selectionName,
      odds: oddsValue
    });
  };

  const isSelected = (outcomeId: string) => selections.some(s => s.outcome_id === outcomeId);

  return (
    <div className="bg-white border-b border-gray-100 p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{league}</span>
        <span className={`text-[10px] font-bold ${time === 'LIVE' ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>{time}</span>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <span className="font-bold text-sm text-gray-800">{homeTeam}</span>
          <span className="font-bold text-sm text-gray-800">{awayTeam}</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => handleSelect(homeTeam, odds.home.id, odds.home.value)}
            className={`flex flex-col items-center justify-center border rounded p-2 min-w-[60px] transition-colors ${
              isSelected(odds.home.id) ? 'bg-brand-gold border-brand-gold' : 'bg-gray-50 border-gray-200 active:bg-brand-gold active:border-brand-gold'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase ${isSelected(odds.home.id) ? 'text-brand-black' : 'text-gray-400'}`}>1</span>
            <span className={`text-sm font-black ${isSelected(odds.home.id) ? 'text-brand-black' : 'text-brand-green'}`}>{odds.home.value.toFixed(2)}</span>
          </button>
          <button 
            onClick={() => handleSelect('Draw', odds.draw.id, odds.draw.value)}
            className={`flex flex-col items-center justify-center border rounded p-2 min-w-[60px] transition-colors ${
              isSelected(odds.draw.id) ? 'bg-brand-gold border-brand-gold' : 'bg-gray-50 border-gray-200 active:bg-brand-gold active:border-brand-gold'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase ${isSelected(odds.draw.id) ? 'text-brand-black' : 'text-gray-400'}`}>X</span>
            <span className={`text-sm font-black ${isSelected(odds.draw.id) ? 'text-brand-black' : 'text-brand-green'}`}>{odds.draw.value.toFixed(2)}</span>
          </button>
          <button 
            onClick={() => handleSelect(awayTeam, odds.away.id, odds.away.value)}
            className={`flex flex-col items-center justify-center border rounded p-2 min-w-[60px] transition-colors ${
              isSelected(odds.away.id) ? 'bg-brand-gold border-brand-gold' : 'bg-gray-50 border-gray-200 active:bg-brand-gold active:border-brand-gold'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase ${isSelected(odds.away.id) ? 'text-brand-black' : 'text-gray-400'}`}>2</span>
            <span className={`text-sm font-black ${isSelected(odds.away.id) ? 'text-brand-black' : 'text-brand-green'}`}>{odds.away.value.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
