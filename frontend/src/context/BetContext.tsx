import React, { createContext, useContext, useState } from 'react';

export interface Selection {
  id: string;
  outcome_id: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  selection: string;
  odds: number;
}

interface BetContextType {
  selections: Selection[];
  addSelection: (selection: Selection) => void;
  removeSelection: (id: string) => void;
  clearSlip: () => void;
}

const BetContext = createContext<BetContextType | undefined>(undefined);

export const BetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<Selection[]>([]);

  const addSelection = (selection: Selection) => {
    setSelections(prev => {
      // Remove any existing selection for the same outcome or just toggle?
      // Usually, one outcome per market per event.
      const filtered = prev.filter(s => s.outcome_id !== selection.outcome_id);
      return [...filtered, selection];
    });
  };

  const removeSelection = (id: string) => {
    setSelections(prev => prev.filter(s => s.id !== id));
  };

  const clearSlip = () => setSelections([]);

  return (
    <BetContext.Provider value={{ selections, addSelection, removeSelection, clearSlip }}>
      {children}
    </BetContext.Provider>
  );
};

export const useBetSlip = () => {
  const context = useContext(BetContext);
  if (context === undefined) {
    throw new Error('useBetSlip must be used within a BetProvider');
  }
  return context;
};
