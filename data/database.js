const dotenv = require('dotenv');
dotenv.config();

const { MongoClient } = require('mongodb');

let client;
let db;

const initDb = (callback) => {
  if (db) {
    console.log('Db is already initialized');
    return callback(null, db);
  }

  MongoClient.connect(process.env.MONGODB_URL)
    .then((connectedClient) => {
      client = connectedClient;
      db = client.db(process.env.DB_NAME || 'test'); 
      console.log('Database connected successfully');
      callback(null, db);
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      callback(err);
    });
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDb first.');
  }
  return db;
};

const closeConnection = () => {
  if (client) {
    return client.close()
      .then(() => console.log('Database connection closed'))
      .catch(err => console.error('Error closing connection:', err));
  }
  return Promise.resolve();
};

module.exports = {
  initDb,
  getDatabase,
  closeConnection
};