const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { username, phone_number, password } = req.body;

  if (!username || !phone_number || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const id = randomUUID();

    await db('users').insert({
      id,
      username,
      phone_number,
      password_hash
    });

    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db('users').where({ username }).first();

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      balance: user.balance,
      phone_number: user.phone_number
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router;
