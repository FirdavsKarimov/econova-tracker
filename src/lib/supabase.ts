
import { checkConnection } from './mongodb';

// This is a stub implementation to keep compatibility with components that might still use supabase
// In a real app, you'd either fully migrate away from Supabase or properly implement both
export const supabase = {
  auth: {
    getUser: async () => {
      const isConnected = await checkConnection();
      return {
        data: {
          user: isConnected ? { 
            id: 'mongodb-user',
            user_metadata: {
              full_name: 'MongoDB User',
              avatar_url: null
            },
            email: 'user@example.com'
          } : null
        },
        error: isConnected ? null : new Error('Not connected to MongoDB')
      };
    },
    getSession: async () => {
      const isConnected = await checkConnection();
      return {
        data: {
          session: isConnected ? { user: { id: 'mongodb-user' } } : null
        },
        error: isConnected ? null : new Error('Not connected to MongoDB')
      };
    },
    signOut: async () => {
      console.log('Signing out with mock implementation');
      return { error: null };
    },
    updateUser: async (data: any) => {
      console.log('Updating user with mock implementation', data);
      return { error: null };
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
  },
  // Add these properties to satisfy the SupabaseClient interface
  supabaseUrl: 'https://example.com',
  supabaseKey: 'mock-key',
  realtime: {},
  realtimeUrl: 'https://example.com',
  rest: {}
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const isConnected = await checkConnection();
  return isConnected ? { 
    id: 'mongodb-user',
    user_metadata: {
      full_name: 'MongoDB User',
      avatar_url: null
    },
    email: 'user@example.com'
  } : null;
};

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  return await checkConnection();
};
