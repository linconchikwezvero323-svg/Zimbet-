import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Event } from '../types';
import MatchCard from '../components/MatchCard';
import { Loader2, Zap } from 'lucide-react';

export default function Live() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveEvents = async () => {
      try {
        const data = await apiService.getEvents();
        // Filter for live events
        setEvents(data.filter(e => e.status === 'live'));
      } catch (error) {
        console.error('Error fetching live events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveEvents();
    // Refresh every 30 seconds for live odds
    const interval = setInterval(fetchLiveEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-gray-50">
      <div className="bg-red-600 text-white p-4 pt-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <Zap size={24} fill="white" /> Live Betting
          </h1>
          <p className="text-white/80 text-[10px] font-black mt-1 uppercase tracking-widest">Real-time action</p>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black animate-pulse uppercase">
          {events.length} Live
        </div>
      </div>

      <div className="flex-grow p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-xs font-black uppercase tracking-widest">Searching for Live Matches...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="flex flex-col">
            {events.map(event => {
              const ftMarket = event.markets.find(m => m.name === '1X2');
              if (!ftMarket || ftMarket.outcomes.length < 3) return null;
              
              return (
                <MatchCard 
                  key={event.id} 
                  id={event.id}
                  homeTeam={event.home_team}
                  awayTeam={event.away_team}
                  time="LIVE"
                  league={event.league_name}
                  odds={{
                    home: { id: ftMarket.outcomes[0].id, value: ftMarket.outcomes[0].odds },
                    draw: { id: ftMarket.outcomes[1].id, value: ftMarket.outcomes[1].odds },
                    away: { id: ftMarket.outcomes[2].id, value: ftMarket.outcomes[2].odds },
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 p-8 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Zap size={48} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">No Live Events</h3>
            <p className="text-xs mt-2 leading-relaxed">There are currently no live matches available for betting. Check upcoming games for the next kick-off!</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-6 bg-brand-green text-white px-8 py-3 rounded-xl font-black uppercase text-xs shadow-lg shadow-brand-green/20"
            >
              View Upcoming Games
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
