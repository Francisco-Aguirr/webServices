require('dotenv').config();
const express = require('express');
const { initDb } = require('./data/database');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', require('./routes'));
app.use('/api', require('./routes/contacts')); 

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Database connection
initDb((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Connected to database: ${process.env.MONGODB_URL}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  const { closeConnection } = require('./data/database');
  await closeConnection();
  process.exit(0);
});