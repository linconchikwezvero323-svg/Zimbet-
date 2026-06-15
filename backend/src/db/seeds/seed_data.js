const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries to ensure a clean seed
  await knex('bet_legs').del();
  await knex('bets').del();
  await knex('transactions').del();
  await knex('outcomes').del();
  await knex('markets').del();
  await knex('events').del();
  await knex('leagues').del();
  await knex('sports').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  await knex('users').insert([
    {
      id: uuidv4(),
      username: 'admin',
      phone_number: '+263771111111',
      password_hash: passwordHash,
      role: 'admin',
      balance: 1000.00
    },
    {
      id: uuidv4(),
      username: 'jdoe',
      phone_number: '+263770000000',
      password_hash: passwordHash,
      role: 'user',
      balance: 100.00
    }
  ]);

  const footballId = uuidv4();
  await knex('sports').insert([
    { id: footballId, name: 'Football', slug: 'football' }
  ]);

  // Leagues
  const leaguesData = [
    { name: 'Zimbabwe Premier Soccer League', country: 'Zimbabwe', slug: 'zpsl' },
    { name: 'English Premier League', country: 'England', slug: 'epl' },
    { name: 'La Liga', country: 'Spain', slug: 'la-liga' },
    { name: 'UEFA Champions League', country: 'Europe', slug: 'ucl' },
    { name: 'FIFA World Cup', country: 'International', slug: 'world-cup' }
  ];

  const leagues = [];
  for (const l of leaguesData) {
    const id = uuidv4();
    await knex('leagues').insert({
      id,
      sport_id: footballId,
      name: l.name,
      country: l.country
    });
    leagues.push({ ...l, id });
  }

  const getLeagueId = (slug) => leagues.find(l => l.slug === slug).id;

  const matches = [
    // ZPSL
    { league: 'zpsl', home: 'Dynamos', away: 'Highlanders', odds: [2.10, 3.20, 3.50] },
    { league: 'zpsl', home: 'CAPS United', away: 'FC Platinum', odds: [2.80, 3.10, 2.60] },
    { league: 'zpsl', home: 'Chicken Inn', away: 'Ngezi Platinum', odds: [2.50, 3.00, 3.00] },
    { league: 'zpsl', home: 'Bulawayo Chiefs', away: 'Manica Diamonds', odds: [3.00, 3.00, 2.50] },
    { league: 'zpsl', home: 'Hwange', away: 'Herentals', odds: [2.70, 3.00, 2.80] },
    { league: 'zpsl', home: 'Yadah', away: 'Simba Bhora', odds: [3.10, 3.00, 2.40] },

    // EPL
    { league: 'epl', home: 'Liverpool', away: 'Manchester City', odds: [2.50, 3.40, 2.70] },
    { league: 'epl', home: 'Arsenal', away: 'Tottenham', odds: [1.85, 3.75, 4.00] },
    { league: 'epl', home: 'Chelsea', away: 'West Ham', odds: [1.70, 3.90, 4.80] },
    { league: 'epl', home: 'Manchester United', away: 'Newcastle', odds: [2.10, 3.60, 3.30] },
    { league: 'epl', home: 'Aston Villa', away: 'Brighton', odds: [2.25, 3.50, 3.10] },
    { league: 'epl', home: 'Wolves', away: 'Fulham', odds: [2.40, 3.30, 3.00] },
    { league: 'epl', home: 'Everton', away: 'Crystal Palace', odds: [2.50, 3.25, 2.90] },

    // La Liga
    { league: 'la-liga', home: 'Real Madrid', away: 'Barcelona', odds: [2.05, 3.70, 3.40] },
    { league: 'la-liga', home: 'Atletico Madrid', away: 'Real Sociedad', odds: [1.90, 3.30, 4.50] },
    { league: 'la-liga', home: 'Sevilla', away: 'Real Betis', odds: [2.45, 3.20, 3.00] },
    { league: 'la-liga', home: 'Athletic Bilbao', away: 'Villarreal', odds: [2.15, 3.40, 3.40] },
    { league: 'la-liga', home: 'Valencia', away: 'Osasuna', odds: [2.20, 3.10, 3.60] },
    { league: 'la-liga', home: 'Getafe', away: 'Mallorca', odds: [2.60, 3.00, 3.10] },

    // UCL
    { league: 'ucl', home: 'Bayern Munich', away: 'PSG', odds: [2.10, 3.80, 3.20] },
    { league: 'ucl', home: 'Inter Milan', away: 'AC Milan', odds: [2.30, 3.25, 3.30] },
    { league: 'ucl', home: 'Dortmund', away: 'Atletico Madrid', odds: [2.40, 3.40, 2.90] },
    { league: 'ucl', home: 'Porto', away: 'Benfica', odds: [2.55, 3.30, 2.80] },
    { league: 'ucl', home: 'Napoli', away: 'Lazio', odds: [1.95, 3.50, 4.00] },
    { league: 'ucl', home: 'RB Leipzig', away: 'Juventus', odds: [2.40, 3.30, 3.00] },

    // World Cup
    { league: 'world-cup', home: 'Zimbabwe', away: 'South Africa', odds: [3.50, 3.20, 2.15] },
    { league: 'world-cup', home: 'Brazil', away: 'Argentina', odds: [2.20, 3.30, 3.40] },
    { league: 'world-cup', home: 'France', away: 'England', odds: [2.40, 3.30, 3.00] },
    { league: 'world-cup', home: 'Morocco', away: 'Senegal', odds: [2.70, 3.10, 2.80] },
    { league: 'world-cup', home: 'USA', away: 'Mexico', odds: [2.35, 3.25, 3.20] },
    { league: 'world-cup', home: 'Japan', away: 'South Korea', odds: [2.45, 3.20, 3.00] },
    { league: 'world-cup', home: 'Germany', away: 'Italy', odds: [2.30, 3.30, 3.20] }
  ];

  for (const match of matches) {
    const eventId = uuidv4();
    const startTime = new Date();
    // Spread matches over the next 7 days
    startTime.setHours(startTime.getHours() + Math.floor(Math.random() * 168));

    await knex('events').insert({
      id: eventId,
      league_id: getLeagueId(match.league),
      home_team: match.home,
      away_team: match.away,
      start_time: startTime,
      status: 'upcoming'
    });

    const marketId = uuidv4();
    await knex('markets').insert({
      id: marketId,
      event_id: eventId,
      name: '1X2'
    });

    await knex('outcomes').insert([
      { id: uuidv4(), market_id: marketId, name: match.home, odds: match.odds[0] },
      { id: uuidv4(), market_id: marketId, name: 'Draw', odds: match.odds[1] },
      { id: uuidv4(), market_id: marketId, name: match.away, odds: match.odds[2] }
    ]);
  }
};
