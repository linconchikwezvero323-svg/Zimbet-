require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const sportsRoutes = require('./src/routes/sports');
const betsRoutes = require('./src/routes/bets');
const walletRoutes = require('./src/routes/wallet');
const adminRoutes = require('./src/routes/admin');
const paymentRoutes = require('./src/routes/payments');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sports', sportsRoutes);
app.use('/api/v1/bets', betsRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Zimbet API running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Mock EcoCash: http://0.0.0.0:${PORT}/api/v1/payments/ecocash/deposit`);
  console.log(`📱 Mock OneMoney: http://0.0.0.0:${PORT}/api/v1/payments/mobile-money/deposit`);
});
