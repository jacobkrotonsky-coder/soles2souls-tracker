require('dotenv').config();
const express = require('express');
const path = require('path');
const { init } = require('./db');
const webhookRouter = require('./routes/webhook');
const counterRouter = require('./routes/counter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/webhooks', webhookRouter);
app.use('/api/counter', counterRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

init()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
