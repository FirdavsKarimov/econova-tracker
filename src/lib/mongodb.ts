
import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://amalifytest:y4xhFCH3jS45xtIP@firdavs284.3kwaf.mongodb.net/econova';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connection singleton
let clientPromise: Promise<MongoClient>;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
if (import.meta.env.DEV) {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = client.connect();
}

export default clientPromise;

// Helper function to get the database instance
export const getDatabase = async () => {
  const client = await clientPromise;
  return client.db('econova');
};

// Helper function to get a collection
export const getCollection = async (collectionName: string) => {
  const db = await getDatabase();
  return db.collection(collectionName);
};

// Helper to check connection
export const checkConnection = async () => {
  try {
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connection successful");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
};
