import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global;

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Database collections
export const getDatabase = async () => {
  const client = await clientPromise;
  return client.db('stealth_chat');
};

export const getCollection = async (collectionName) => {
  const db = await getDatabase();
  return db.collection(collectionName);
};

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  MESSAGES: 'messages',
  ROOMS: 'rooms',
  FILES: 'files'
};

// Initialize collections with indexes
export const initializeDatabase = async () => {
  try {
    const db = await getDatabase();
    
    // Create indexes for better performance
    await db.collection(COLLECTIONS.MESSAGES).createIndex({ roomId: 1, timestamp: -1 });
    await db.collection(COLLECTIONS.MESSAGES).createIndex({ sender: 1 });
    await db.collection(COLLECTIONS.USERS).createIndex({ userId: 1 }, { unique: true });
    await db.collection(COLLECTIONS.ROOMS).createIndex({ participants: 1 });
    await db.collection(COLLECTIONS.FILES).createIndex({ messageId: 1 });
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export default clientPromise;
