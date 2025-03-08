import { checkConnection } from './mongodb';

// This is a stub implementation to keep compatibility with components that might still use supabase
// In a real app, you'd either fully migrate away from Supabase or properly implement both
export const supabase = {
  auth: {
    getUser: async () => {
      const isConnected = await checkConnection();
      return {
        data: {
          user: isConnected ? { id: 'mongodb-user' } : null
        },
        error: isConnected ? null : new Error('Not connected to MongoDB')
      };
    },
    onAuthStateChange: (callback: any) => {
      // Return an object with an unsubscribe method for compatibility
      console.log('Supabase auth state change subscription is not implemented');
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  },
  from: (table: string) => {
    console.warn(`Supabase operation on table ${table} is not implemented. Use MongoDB directly.`);
    return {
      select: () => ({
        single: async () => ({ data: null, error: new Error('Not implemented') }),
        order: () => ({ data: null, error: new Error('Not implemented') })
      }),
      insert: async () => ({ data: null, error: new Error('Not implemented') }),
      update: async () => ({ data: null, error: new Error('Not implemented') }),
      delete: async () => ({ data: null, error: new Error('Not implemented') }),
      eq: () => ({ data: null, error: new Error('Not implemented') })
    };
  }
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const isConnected = await checkConnection();
  return isConnected ? { id: 'mongodb-user' } : null;
};

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  return await checkConnection();
};
