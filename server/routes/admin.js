const express = require('express');
const router = express.Router();

const { sequelize } = require('../config/database');
const { populateProductionData } = require('../scripts/populateProductionData');
const { User } = require('../models');

// Simple auth using header token to avoid exposing publicly
router.post('/seed', async (req, res) => {
  try {
    const provided = req.header('X-Seed-Token');
    const expected = process.env.ADMIN_SEED_TOKEN;
    if (!expected || provided !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Ensure DB schema exists in production
    await sequelize.sync({ alter: true });

    await populateProductionData();
    return res.json({ success: true, message: 'Seeding completed' });
  } catch (error) {
    console.error('Seed endpoint error:', error);
    return res.status(500).json({ error: 'Seeding failed', details: String(error.message || error) });
  }
});

module.exports = router;

// TEMP: reset demo user password to demo123
router.post('/reset-demo-user', async (req, res) => {
  try {
    const provided = req.header('X-Seed-Token');
    const expected = process.env.ADMIN_SEED_TOKEN;
    if (!expected || provided !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await User.findOne({ where: { email: 'demo@xeno.com' } });
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found' });
    }
    // Set plain password; model hook will hash once
    await user.update({ password: 'demo123' });
    return res.json({ success: true, message: 'Demo user password reset' });
  } catch (error) {
    console.error('Reset demo user error:', error);
    return res.status(500).json({ error: 'Reset failed', details: String(error.message || error) });
  }
});

// TEMP: generate auth token for a user (bypass password) for demo
router.post('/token', async (req, res) => {
  try {
    const provided = req.header('X-Seed-Token');
    const expected = process.env.ADMIN_SEED_TOKEN;
    if (!expected || provided !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const email = (req.body?.email || 'demo@xeno.com').toLowerCase();
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return res.json({ success: true, data: { user: user.toJSON(), token } });
  } catch (error) {
    console.error('Token issue error:', error);
    return res.status(500).json({ error: 'Token issue failed', details: String(error.message || error) });
  }
});


