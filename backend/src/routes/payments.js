const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory transaction store (for mock)
const transactions = {};

// Webhook secret for signature verification
const WEBHOOK_SECRET = process.env.ECOCASH_WEBHOOK_SECRET || 'mock-ecocash-secret-key';

// Mock EcoCash API configuration
const MOCK_ECOCASH_MERCHANT_ID = process.env.ECOCASH_MERCHANT_ID || 'MOCK_ECOCASH_001';
const MOCK_ECOCASH_API_KEY = process.env.ECOCASH_API_KEY || 'mock-api-key-ecocash-2024';

/**
 * POST /api/v1/payments/ecocash/deposit
 * Initiate an EcoCash C2B payment (mock)
 * Simulates USSD push to customer phone
 */
router.post('/ecocash/deposit', (req, res) => {
  const { phone_number, amount, currency = 'USD' } = req.body;

  if (!phone_number || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and amount are required'
    });
  }

  if (amount < 1) {
    return res.status(400).json({
      success: false,
      message: 'Minimum deposit is $1.00'
    });
  }

  // Generate unique transaction reference
  const platformRef = `ECOCASH_MOCK_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const externalRef = `E${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // Store transaction
  transactions[platformRef] = {
    platformRef,
    externalRef,
    phone_number,
    amount,
    currency,
    status: 'pending',
    created_at: new Date().toISOString(),
    method: 'ecocash'
  };

  console.log(`[MOCK ECOCASH] USSD push sent to ${phone_number} for $${amount}`);
  console.log(`[MOCK ECOCASH] User should dial *151# and enter PIN to authorize`);

  // Simulate async webhook callback after 3 seconds
  setTimeout(() => {
    const tx = transactions[platformRef];
    if (tx && tx.status === 'pending') {
      tx.status = 'success';
      tx.confirmed_at = new Date().toISOString();
      console.log(`[MOCK ECOCASH] Payment confirmed: ${platformRef}`);
      
      // This would normally hit our webhook endpoint
      // For mock, we also update the in-memory record
      try {
        const axios = require('axios');
        const webhookUrl = process.env.WEBHOOK_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
        axios.post(`${webhookUrl}/api/v1/payments/webhook/ecocash`, {
          transaction_ref: platformRef,
          external_ref: externalRef,
          phone_number,
          amount,
          currency,
          status: 'success',
          signature: crypto.createHmac('sha256', WEBHOOK_SECRET)
            .update(`${platformRef}${amount}${externalRef}`)
            .digest('hex')
        }).catch(err => {
          // Silent fail for mock - the direct check endpoint handles it
        });
      } catch(e) {
        // Webhook module not available, that's fine
      }
    }
  }, 3000);

  res.json({
    success: true,
    message: 'USSD push sent. Please check your phone and enter your EcoCash PIN to authorize.',
    data: {
      platform_ref: platformRef,
      external_ref: externalRef,
      amount,
      currency,
      status: 'pending',
      instructions: 'Dial *151# and enter your EcoCash PIN to complete payment'
    }
  });
});

/**
 * GET /api/v1/payments/ecocash/status/:ref
 * Check transaction status
 */
router.get('/ecocash/status/:ref', (req, res) => {
  const tx = transactions[req.params.ref];
  
  if (!tx) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.json({
    success: true,
    data: {
      platform_ref: tx.platformRef,
      external_ref: tx.externalRef,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      created_at: tx.created_at,
      confirmed_at: tx.confirmed_at || null
    }
  });
});

/**
 * POST /api/v1/payments/ecocash/withdraw
 * Mock B2C withdrawal
 */
router.post('/ecocash/withdraw', (req, res) => {
  const { phone_number, amount, currency = 'USD' } = req.body;

  if (!phone_number || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and amount are required'
    });
  }

  const platformRef = `ECOCASH_WITHDRAW_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  transactions[platformRef] = {
    platformRef,
    phone_number,
    amount,
    currency,
    status: 'processing',
    type: 'withdrawal',
    created_at: new Date().toISOString(),
    method: 'ecocash'
  };

  // Simulate processing
  setTimeout(() => {
    const tx = transactions[platformRef];
    if (tx) tx.status = 'success';
  }, 5000);

  res.json({
    success: true,
    message: 'Withdrawal is being processed. Funds will be sent to your EcoCash wallet.',
    data: {
      platform_ref: platformRef,
      amount,
      currency,
      status: 'processing',
      expected_completion: '2-5 minutes'
    }
  });
});

/**
 * POST /api/v1/payments/mobile-money/deposit
 * Unified deposit endpoint (accepts both EcoCash and OneMoney)
 */
router.post('/mobile-money/deposit', (req, res) => {
  const { phone_number, amount, method, currency = 'USD' } = req.body;

  if (!phone_number || !amount || !method) {
    return res.status(400).json({
      success: false,
      message: 'Phone number, amount, and method (ecocash/onemoney) are required'
    });
  }

  if (!['ecocash', 'onemoney'].includes(method)) {
    return res.status(400).json({
      success: false,
      message: 'Method must be "ecocash" or "onemoney"'
    });
  }

  const platformRef = `${method.toUpperCase()}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const externalRef = `${method === 'ecocash' ? 'E' : 'OM'}${Date.now()}`;

  transactions[platformRef] = {
    platformRef,
    externalRef,
    phone_number,
    amount,
    currency,
    status: 'pending',
    method,
    created_at: new Date().toISOString()
  };

  // Simulate async confirmation
  setTimeout(() => {
    const tx = transactions[platformRef];
    if (tx && tx.status === 'pending') {
      tx.status = 'success';
      tx.confirmed_at = new Date().toISOString();
    }
  }, 3000);

  const methodNames = { ecocash: 'EcoCash', onemoney: 'OneMoney' };

  res.json({
    success: true,
    message: `${methodNames[method]} USSD push sent. Please check your phone.`,
    data: {
      platform_ref: platformRef,
      amount,
      currency,
      method,
      status: 'pending'
    }
  });
});

/**
 * GET /api/v1/payments/transaction/:ref
 * Check any transaction status
 */
router.get('/transaction/:ref', (req, res) => {
  const tx = transactions[req.params.ref];
  
  if (!tx) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.json({
    success: true,
    data: tx
  });
});

/**
 * POST /api/v1/payments/webhook/ecocash
 * Webhook receiver for EcoCash callbacks
 */
router.post('/webhook/ecocash', (req, res) => {
  const { transaction_ref, external_ref, amount, status, signature } = req.body;

  // Verify webhook signature
  const expectedSig = crypto.createHmac('sha256', WEBHOOK_SECRET)
    .update(`${transaction_ref}${amount}${external_ref}`)
    .digest('hex');

  if (signature !== expectedSig) {
    console.warn('[MOCK ECOCASH] Webhook signature mismatch!');
    return res.status(401).json({ success: false, message: 'Invalid signature' });
  }

  // Update transaction
  if (transactions[transaction_ref]) {
    transactions[transaction_ref].status = status;
    transactions[transaction_ref].confirmed_at = new Date().toISOString();
    transactions[transaction_ref].external_ref = external_ref;
    console.log(`[MOCK ECOCASH] Webhook received: ${transaction_ref} -> ${status}`);
  }

  res.json({ success: true, message: 'Webhook received' });
});

module.exports = router;
