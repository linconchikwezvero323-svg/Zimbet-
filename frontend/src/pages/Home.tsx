import { useState, useEffect } from 'react';
import { Trophy, Flame, Calendar, Search } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import { apiService } from '../services/api';
import { Event, Sport } from '../types';

export default function Home() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sportsData, eventsData] = await Promise.all([
          apiService.getSports(),
          apiService.getEvents()
        ]);
        setSports(sportsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="flex flex-col">
      {/* Category Selection */}
      <div className="bg-brand-black text-white px-2 py-3 overflow-x-auto flex gap-4 no-scrollbar">
        {sports.map(sport => (
          <button key={sport.id} className="flex flex-col items-center min-w-[70px] gap-1 opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-2xl">{sport.id === 'football' ? '⚽' : sport.id === 'basketball' ? '🏀' : '🏏'}</span>
            <span className="text-[10px] font-bold uppercase">{sport.name}</span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-2 flex gap-2 border-b border-gray-200">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search teams, leagues..." 
            className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </div>
        <button className="bg-gray-100 p-2 rounded-full text-gray-600">
          <Calendar size={18} />
        </button>
      </div>

      {/* Banner */}
      <div className="p-4">
        <div className="zimbet-gradient rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-1 italic">DYNAMOS vs HIGHLANDERS</h2>
            <p className="text-brand-gold font-bold mb-4">THE HARARE DERBY - ACCUMULATOR BOOST +20%</p>
            <button className="bg-brand-gold text-brand-black px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider shadow-md">
              Bet Now
            </button>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
            <Trophy size={150} />
          </div>
        </div>
      </div>

      {/* Match Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        <button className="flex-1 py-3 text-xs font-black uppercase border-b-2 border-brand-green text-brand-green flex items-center justify-center gap-2">
          <Flame size={14} /> Upcoming
        </button>
        <button className="flex-1 py-3 text-xs font-black uppercase text-gray-400">Leagues</button>
        <button className="flex-1 py-3 text-xs font-black uppercase text-gray-400">Popular</button>
      </div>

      {/* Matches List */}
      <div className="flex flex-col bg-gray-50">
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
            Loading Matches...
          </div>
        ) : (
          events.map(event => {
            const ftMarket = event.markets.find(m => m.name === '1X2');
            if (!ftMarket || ftMarket.outcomes.length < 3) return null;
            
            return (
              <MatchCard 
                key={event.id} 
                id={event.id}
                homeTeam={event.home_team}
                awayTeam={event.away_team}
                time={event.status === 'live' ? 'LIVE' : new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                league={event.league_name}
                odds={{
                  home: { id: ftMarket.outcomes[0].id, value: ftMarket.outcomes[0].odds },
                  draw: { id: ftMarket.outcomes[1].id, value: ftMarket.outcomes[1].odds },
                  away: { id: ftMarket.outcomes[2].id, value: ftMarket.outcomes[2].odds },
                }}
              />
            );
          })
        )}
      </div>

      <div className="p-4 text-center">
        <button className="text-brand-green font-bold text-sm">View More Matches</button>
      </div>
    </div>
  )
}
