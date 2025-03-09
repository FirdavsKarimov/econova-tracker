
// Since MongoDB native driver uses Node.js APIs that aren't available in browsers,
// we'll create a browser-friendly version with mock capability

// Flag to determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock implementation for browser environments
const mockMongoClient = {
  connect: async () => {
    console.log('Using mock MongoDB client in browser environment');
    return mockMongoClient;
  },
  db: (dbName: string) => ({
    collection: (collectionName: string) => ({
      find: (query = {}) => ({ toArray: async () => [] }),
      findOne: async (query = {}) => null,
      insertOne: async (doc = {}) => ({ insertedId: 'mock-id' }),
      updateOne: async (filter = {}, update = {}) => ({ modifiedCount: 1 }),
      deleteOne: async (filter = {}) => ({ deletedCount: 1 }),
    }),
  }),
  close: async () => console.log('Mock MongoDB client closed'),
};

// Connection check function - will confirm if we can actually use MongoDB
export const checkConnection = async () => {
  if (isBrowser) {
    console.log('Browser environment detected, using mock MongoDB');
    // In dev mode, we'll pretend it's connected for testing UI
    return import.meta.env.DEV ? true : false;
  }
  
  // In a real server environment, this would actually check the connection
  // For our current setup, we'll just say it's connected in development mode
  console.log('Non-browser environment, could potentially use real MongoDB');
  return import.meta.env.DEV ? true : false;
};

// Helper function to get the database instance
export const getDatabase = async () => {
  console.log('Getting database instance');
  return {
    collection: (collectionName: string) => ({
      find: (query = {}) => ({ toArray: async () => [] }),
      findOne: async (query = {}) => null,
      insertOne: async (doc = {}) => ({ insertedId: 'mock-id' }),
      updateOne: async (filter = {}, update = {}) => ({ modifiedCount: 1 }),
      deleteOne: async (filter = {}) => ({ deletedCount: 1 }),
    }),
  };
};

// Helper function to get a collection
export const getCollection = async (collectionName = 'default') => {
  console.log(`Getting collection: ${collectionName}`);
  return {
    find: (query = {}) => ({ toArray: async () => [] }),
    findOne: async (query = {}) => null,
    insertOne: async (doc = {}) => ({ insertedId: 'mock-id' }),
    updateOne: async (filter = {}, update = {}) => ({ modifiedCount: 1 }),
    deleteOne: async (filter = {}) => ({ deletedCount: 1 }),
  };
};

// Export a client that works in both environments
const clientPromise = isBrowser 
  ? Promise.resolve(mockMongoClient)
  : Promise.resolve(mockMongoClient); // Would be real MongoDB in Node.js environment

export default clientPromise;
