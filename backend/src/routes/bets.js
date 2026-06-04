const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Place bet
router.post('/', authenticate, async (req, res) => {
  const { stake, legs } = req.body; // legs: [{ outcome_id }]

  if (!stake || !legs || !Array.isArray(legs) || legs.length === 0) {
    return res.status(400).json({ message: 'Invalid bet request' });
  }

  const trx = await db.transaction();
  try {
    const user = await trx('users').where({ id: req.user.id }).forUpdate().first();
    
    if (user.balance < stake) {
      await trx.rollback();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Calculate potential payout and verify outcomes
    let totalOdds = 1.0;
    const legData = [];

    for (const leg of legs) {
      const outcome = await trx('outcomes')
        .join('markets', 'outcomes.market_id', 'markets.id')
        .join('events', 'markets.event_id', 'events.id')
        .select('outcomes.*', 'events.status as event_status', 'markets.status as market_status')
        .where('outcomes.id', leg.outcome_id)
        .first();

      if (!outcome || outcome.status !== 'active' || outcome.market_status !== 'open' || outcome.event_status !== 'upcoming') {
        await trx.rollback();
        return res.status(400).json({ message: `Outcome ${leg.outcome_id} is no longer available` });
      }

      totalOdds *= outcome.odds;
      legData.push({
        id: uuidv4(),
        outcome_id: outcome.id,
        odds_at_placement: outcome.odds
      });
    }

    const potential_payout = stake * totalOdds;
    const betId = uuidv4();

    // Deduct balance
    await trx('users').where({ id: req.user.id }).update({
      balance: user.balance - stake
    });

    // Create bet
    await trx('bets').insert({
      id: betId,
      user_id: req.user.id,
      stake,
      potential_payout,
      status: 'pending'
    });

    // Create legs
    await trx('bet_legs').insert(legData.map(leg => ({ ...leg, bet_id: betId })));

    // Create transaction record
    await trx('transactions').insert({
      id: uuidv4(),
      user_id: req.user.id,
      amount: -stake,
      type: 'bet_placed',
      external_reference: `BET-${betId.substring(0, 8)}`,
      status: 'completed'
    });

    await trx.commit();
    res.status(201).json({ 
      message: 'Bet placed successfully', 
      bet_id: betId,
      potential_payout
    });
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ message: 'Error placing bet', error: error.message });
  }
});

// My bets
router.get('/', authenticate, async (req, res) => {
  try {
    const bets = await db('bets')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

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
    res.status(500).json({ message: 'Error fetching bet history' });
  }
});

module.exports = router;
