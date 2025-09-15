const express = require('express');
const router = express.Router();

const { sequelize } = require('../config/database');
const { populateProductionData } = require('../scripts/populateProductionData');

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


