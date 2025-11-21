const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
let _db;

async function connectToServer(callback) {
  try {
    const client = await MongoClient.connect(uri);
    _db = client.db(dbName);
    console.log(`✅ Connected to MongoDB, database: ${dbName}`);

    if (callback) callback();
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    if (callback) callback(error);
  }
}

function getDb() {
  if (!_db) {
    throw new Error('Database is not initialized. Call connectToServer first.');
  }
  return _db;
}

module.exports = { connectToServer, getDb };
