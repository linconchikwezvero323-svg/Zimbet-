const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Deposit (Simulated)
router.post('/deposit', authenticate, async (req, res) => {
  const { amount, method, phone_number } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  const transactionId = randomUUID();
  
  try {
    // In a real app, we'd call EcoCash/InnBucks API here.
    // For MVP, we simulate a "pending" transaction and then auto-complete it after a delay.
    
    await db('transactions').insert({
      id: transactionId,
      user_id: req.user.id,
      amount,
      type: 'deposit',
      payment_method: method,
      external_reference: `DEP-SIM-${transactionId.substring(0, 8)}`,
      status: 'pending'
    });

    // Simulate background processing
    setTimeout(async () => {
      try {
        const trx = await db.transaction();
        const user = await trx('users').where({ id: req.user.id }).forUpdate().first();
        
        await trx('users').where({ id: req.user.id }).update({
          balance: user.balance + amount
        });

        await trx('transactions').where({ id: transactionId }).update({
          status: 'completed'
        });

        await trx.commit();
        console.log(`Simulated deposit completed for user ${req.user.id}: ${amount}`);
      } catch (err) {
        console.error('Simulated deposit failed:', err);
      }
    }, 10000); // 10 seconds delay

    res.json({
      message: 'Deposit initiated. Please check your phone for the PIN prompt.',
      transaction_id: transactionId,
      status: 'pending'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating deposit' });
  }
});

// Withdraw (Simulated)
router.post('/withdraw', authenticate, async (req, res) => {
  const { amount, method, phone_number } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const trx = await db.transaction();
    const user = await trx('users').where({ id: req.user.id }).forUpdate().first();

    if (user.balance < amount) {
      await trx.rollback();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const transactionId = randomUUID();

    // Deduct balance immediately for withdrawal
    await trx('users').where({ id: req.user.id }).update({
      balance: user.balance - amount
    });

    await trx('transactions').insert({
      id: transactionId,
      user_id: req.user.id,
      amount: -amount,
      type: 'withdrawal',
      payment_method: method,
      external_reference: `WTH-SIM-${transactionId.substring(0, 8)}`,
      status: 'pending' // Admin would approve this in a real scenario
    });

    await trx.commit();

    res.json({
      message: 'Withdrawal request submitted.',
      transaction_id: transactionId,
      status: 'pending'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating withdrawal' });
  }
});

// Transactions
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await db('transactions')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

module.exports = router;
