const express = require('express');
const { pool } = require('../db');

const router = express.Router();

const BASE_COUNT = parseInt(process.env.BASE_COUNT || '0', 10);

// GET /api/counter
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT COALESCE(SUM(shoe_quantity), 0)::int AS total FROM donations'
    );
    res.json({ total: BASE_COUNT + rows[0].total });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
