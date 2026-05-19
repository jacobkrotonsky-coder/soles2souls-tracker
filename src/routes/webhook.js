const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db');

const router = express.Router();

function verifyShopifyHmac(req) {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  if (!hmac) return false;
  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

// POST /webhooks/orders/paid
router.post('/orders/paid', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  req.body = JSON.parse(req.body);
  next();
}, async (req, res) => {
  if (!verifyShopifyHmac(req)) {
    return res.status(401).send('Unauthorized');
  }

  const order = req.body;
  const shoeQty = order.line_items
    ? order.line_items.reduce((sum, item) => sum + item.quantity, 0)
    : 1;

  try {
    await pool.query(
      `INSERT INTO donations (shopify_order_id, customer_email, shoe_quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (shopify_order_id) DO NOTHING`,
      [String(order.id), order.email || null, shoeQty]
    );
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
