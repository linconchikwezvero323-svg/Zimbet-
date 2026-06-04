const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all sports
router.get('/', async (req, res) => {
  try {
    const sports = await db('sports').select('*');
    res.json(sports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sports' });
  }
});

// Get upcoming events with markets and outcomes
router.get('/events', async (req, res) => {
  const { sport, league } = req.query;

  try {
    let query = db('events')
      .join('leagues', 'events.league_id', 'leagues.id')
      .join('sports', 'leagues.sport_id', 'sports.id')
      .select(
        'events.*',
        'leagues.name as league_name',
        'sports.name as sport_name'
      )
      .where('events.status', 'upcoming');

    if (sport) query = query.where('sports.slug', sport);
    if (league) query = query.where('leagues.id', league);

    const events = await query;

    // Attach markets and outcomes to each event
    const eventsWithOdds = await Promise.all(events.map(async (event) => {
      const markets = await db('markets').where({ event_id: event.id, status: 'open' });
      
      const marketsWithOutcomes = await Promise.all(markets.map(async (market) => {
        const outcomes = await db('outcomes').where({ market_id: market.id, status: 'active' });
        return { ...market, outcomes };
      }));

      return { ...event, markets: marketsWithOutcomes };
    }));

    res.json(eventsWithOdds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get event details
router.get('/events/:id', async (req, res) => {
  try {
    const event = await db('events')
      .join('leagues', 'events.league_id', 'leagues.id')
      .select('events.*', 'leagues.name as league_name')
      .where('events.id', req.params.id)
      .first();

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const markets = await db('markets').where({ event_id: event.id });
    const marketsWithOutcomes = await Promise.all(markets.map(async (market) => {
      const outcomes = await db('outcomes').where({ market_id: market.id });
      return { ...market, outcomes };
    }));

    res.json({ ...event, markets: marketsWithOutcomes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event details' });
  }
});

module.exports = router;
