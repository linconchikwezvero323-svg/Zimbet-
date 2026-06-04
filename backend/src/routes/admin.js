const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.use(authenticate, authorizeAdmin);

// Update odds
router.post('/outcomes/:id/odds', async (req, res) => {
  const { odds } = req.body;
  try {
    await db('outcomes').where({ id: req.params.id }).update({ odds });
    res.json({ message: 'Odds updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating odds' });
  }
});

// Resolve event
router.post('/events/:id/resolve', async (req, res) => {
  const { result_home, result_away } = req.body;

  const trx = await db.transaction();
  try {
    const event = await trx('events').where({ id: req.params.id }).first();
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 1. Update event status and results
    await trx('events').where({ id: req.params.id }).update({
      status: 'finished',
      result_home,
      result_away
    });

    // 2. Determine winning outcomes for 1X2 market (example)
    const markets = await trx('markets').where({ event_id: req.params.id });
    for (const market of markets) {
      const outcomes = await trx('outcomes').where({ market_id: market.id });
      
      for (const outcome of outcomes) {
        let isWinner = false;
        if (market.name === '1X2') {
          if (outcome.name === event.home_team && result_home > result_away) isWinner = true;
          else if (outcome.name === event.away_team && result_away > result_home) isWinner = true;
          else if (outcome.name === 'Draw' && result_home === result_away) isWinner = true;
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
    // A bet is won if ALL its legs are 'won'.
    // A bet is lost if ANY of its legs are 'lost'.
    // We only process 'pending' bets.
    
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

module.exports = router;
