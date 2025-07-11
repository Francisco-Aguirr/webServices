require('dotenv').config();
const express = require('express');
const { initDb } = require('./data/database');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const port = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Contacts API',
      version: '1.0.0',
      description: 'API for managing contacts',
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

const cors = require('cors');

//CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.RENDER_EXTERNAL_URL 
    : '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', require('./routes'));
app.use('/api', require('./routes/contacts')); 

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  const { closeConnection } = require('./data/database');
  await closeConnection();
  process.exit(0);
});