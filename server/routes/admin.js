const express = require('express');
const router = express.Router();

const { sequelize } = require('../config/database');
const { populateProductionData } = require('../scripts/populateProductionData');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

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
    const hash = await bcrypt.hash('demo123', 12);
    await user.update({ password: hash });
    return res.json({ success: true, message: 'Demo user password reset' });
  } catch (error) {
    console.error('Reset demo user error:', error);
    return res.status(500).json({ error: 'Reset failed', details: String(error.message || error) });
  }
});


