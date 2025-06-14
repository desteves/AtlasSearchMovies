const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log('📨 Incoming request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    console.log('📤 Outgoing response:', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      body: data,
      timestamp: new Date().toISOString()
    });
    return originalSend.apply(res, arguments);
  };
  next();
});

// MongoDB Connection
let client;
let db;

async function connectToMongo() {
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.NODE_ENV === 'test' ? 'sample_mflix_test' : 'sample_mflix');
    console.log(`Connected to MongoDB Atlas - ${db.databaseName} database`);

    // Verify we're connected to the right database
    if (db.databaseName !== 'sample_mflix' && db.databaseName !== 'sample_mflix_test') {
      console.warn('Warning: Not connected to sample_mflix database!');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
const searchRoutes = require('./routes/search');
app.use('/api', searchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down...');
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  connectToMongo().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

// Export for testing
module.exports = app;