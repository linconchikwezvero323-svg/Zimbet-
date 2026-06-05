const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.use(authenticate, authorizeAdmin);

// Update odds
// Requirement: PUT /api/v1/admin/events/:id/odds - update odds (body: { outcomeId, odds })
router.put('/events/:id/odds', async (req, res) => {
  const { outcomeId, odds } = req.body;
  try {
    await db('outcomes').where({ id: outcomeId }).update({ odds });
    res.json({ message: 'Odds updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating odds' });
  }
});

// Resolve event
// Requirement: PUT /api/v1/admin/events/:id/resolve - resolve match (body: { homeScore, awayScore })
router.put('/events/:id/resolve', async (req, res) => {
  const { homeScore, awayScore } = req.body;

  const trx = await db.transaction();
  try {
    const event = await trx('events').where({ id: req.params.id }).first();
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 1. Update event status and results
    await trx('events').where({ id: req.params.id }).update({
      status: 'finished',
      result_home: homeScore,
      result_away: awayScore
    });

    // 2. Determine winning outcomes for 1X2 market (example)
    const markets = await trx('markets').where({ event_id: req.params.id });
    for (const market of markets) {
      const outcomes = await trx('outcomes').where({ market_id: market.id });
      
      for (const outcome of outcomes) {
        let isWinner = false;
        if (market.name === '1X2') {
          if (outcome.name === event.home_team && homeScore > awayScore) isWinner = true;
          else if (outcome.name === event.away_team && awayScore > homeScore) isWinner = true;
          else if (outcome.name === 'Draw' && homeScore === awayScore) isWinner = true;
        }

        await trx('outcomes').where({ id: outcome.id }).update({
          status: isWinner ? 'winner' : 'loser'
        });

        // 3. Update bet legs
        await trx('bet_legs').where({ outcome_id: outcome.id }).update({
          status: isWinner ? 'won' : 'lost'
        });
      }
    }

    // 4. Settle bets
    const pendingBets = await trx('bets').where({ status: 'pending' });
    
    for (const bet of pendingBets) {
      const legs = await trx('bet_legs').where({ bet_id: bet.id });
      
      const allWon = legs.every(l => l.status === 'won');
      const anyLost = legs.some(l => l.status === 'lost');

      if (allWon) {
        // Payout
        const user = await trx('users').where({ id: bet.user_id }).forUpdate().first();
        await trx('users').where({ id: bet.user_id }).update({
          balance: user.balance + bet.potential_payout
        });

        await trx('bets').where({ id: bet.id }).update({ status: 'won' });

        await trx('transactions').insert({
          id: require('uuid').v4(),
          user_id: bet.user_id,
          amount: bet.potential_payout,
          type: 'bet_payout',
          external_reference: `WIN-${bet.id.substring(0, 8)}`,
          status: 'completed'
        });
      } else if (anyLost) {
        await trx('bets').where({ id: bet.id }).update({ status: 'lost' });
      }
    }

    await trx.commit();
    res.json({ message: 'Event resolved and bets settled' });
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ message: 'Error resolving event', error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await db('users').select('id', 'username', 'phone_number', 'role', 'balance', 'created_at');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get all events with markets and outcomes (admin)
router.get('/events', async (req, res) => {
  try {
    const events = await db('events')
      .join('leagues', 'events.league_id', 'leagues.id')
      .join('sports', 'leagues.sport_id', 'sports.id')
      .select(
        'events.*',
        'leagues.name as league_name',
        'sports.name as sport_name'
      )
      .orderBy('events.start_time', 'desc');

    const eventsWithOdds = await Promise.all(events.map(async (event) => {
      const markets = await db('markets').where({ event_id: event.id });
      
      const marketsWithOutcomes = await Promise.all(markets.map(async (market) => {
        const outcomes = await db('outcomes').where({ market_id: market.id });
        return { ...market, outcomes };
      }));

      return { ...event, markets: marketsWithOutcomes };
    }));

    res.json(eventsWithOdds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin events', error: error.message });
  }
});

// View all bets (admin)
router.get('/bets', async (req, res) => {
  try {
    const bets = await db('bets')
      .join('users', 'bets.user_id', 'users.id')
      .select('bets.*', 'users.username', 'users.phone_number')
      .orderBy('bets.created_at', 'desc');

    const betsWithLegs = await Promise.all(bets.map(async (bet) => {
      const legs = await db('bet_legs')
        .join('outcomes', 'bet_legs.outcome_id', 'outcomes.id')
        .join('markets', 'outcomes.market_id', 'markets.id')
        .join('events', 'markets.event_id', 'events.id')
        .select(
          'bet_legs.*',
          'outcomes.name as selection',
          'markets.name as market_name',
          'events.home_team',
          'events.away_team'
        )
        .where({ bet_id: bet.id });
      return { ...bet, legs };
    }));

    res.json(betsWithLegs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all bets', error: error.message });
  }
});

// Get admin stats
// Requirement: GET /api/v1/admin/stats — { totalUsers, activeEvents, totalBets }
router.get('/stats', async (req, res) => {
  try {
    const userCount = await db('users').count('id as count').first();
    const eventCount = await db('events').where({ status: 'upcoming' }).count('id as count').first();
    const betCount = await db('bets').count('id as count').first();

    res.json({
      totalUsers: userCount.count,
      activeEvents: eventCount.count,
      totalBets: betCount.count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;
