const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('bet_legs').del();
  await knex('bets').del();
  await knex('transactions').del();
  await knex('outcomes').del();
  await knex('markets').del();
  await knex('events').del();
  await knex('leagues').del();
  await knex('sports').del();
  await knex('users').del();

  const adminId = uuidv4();
  const userId = uuidv4();
  const passwordHash = await bcrypt.hash('password123', 10);

  await knex('users').insert([
    {
      id: adminId,
      username: 'admin',
      phone_number: '+263771111111',
      password_hash: passwordHash,
      role: 'admin',
      balance: 1000.00
    },
    {
      id: userId,
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

  const zpslId = uuidv4();
  const eplId = uuidv4();
  await knex('leagues').insert([
    { id: zpslId, sport_id: footballId, name: 'Zimbabwe Premier Soccer League', country: 'Zimbabwe' },
    { id: eplId, sport_id: footballId, name: 'English Premier League', country: 'England' }
  ]);

  const event1Id = uuidv4();
  const event2Id = uuidv4();
  const startTime = new Date();
  startTime.setHours(startTime.getHours() + 24);

  await knex('events').insert([
    {
      id: event1Id,
      league_id: zpslId,
      home_team: 'Dynamos',
      away_team: 'Highlanders',
      start_time: startTime,
      status: 'upcoming'
    },
    {
      id: event2Id,
      league_id: eplId,
      home_team: 'Liverpool',
      away_team: 'Manchester City',
      start_time: startTime,
      status: 'upcoming'
    }
  ]);

  // Markets for Event 1
  const market1Id = uuidv4();
  await knex('markets').insert([
    { id: market1Id, event_id: event1Id, name: '1X2' }
  ]);

  await knex('outcomes').insert([
    { id: uuidv4(), market_id: market1Id, name: 'Dynamos', odds: 2.10 },
    { id: uuidv4(), market_id: market1Id, name: 'Draw', odds: 3.20 },
    { id: uuidv4(), market_id: market1Id, name: 'Highlanders', odds: 3.50 }
  ]);

  // Markets for Event 2
  const market2Id = uuidv4();
  await knex('markets').insert([
    { id: market2Id, event_id: event2Id, name: '1X2' }
  ]);

  await knex('outcomes').insert([
    { id: uuidv4(), market_id: market2Id, name: 'Liverpool', odds: 2.50 },
    { id: uuidv4(), market_id: market2Id, name: 'Draw', odds: 3.40 },
    { id: uuidv4(), market_id: market2Id, name: 'Manchester City', odds: 2.70 }
  ]);
};
