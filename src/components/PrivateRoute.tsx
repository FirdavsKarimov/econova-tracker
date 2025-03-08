
import { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const PrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          // Allow navigation to protected routes in dev mode when Supabase isn't configured
          if (error.message.includes('supabaseUrl is required')) {
            console.warn('Using mock data due to missing Supabase configuration');
            setUser({} as any); // Use mock user for development
          } else {
            setUser(null);
          }
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Use mock data in development
        if (import.meta.env.DEV) {
          setUser({} as any); // Mock user for development
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Only set up auth state change subscription if Supabase is configured
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null);
          setLoading(false);
        }
      );

      return () => {
        if (subscription) subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth subscription:', error);
      setLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // In development, allow access to protected routes even without auth
  if (!user && import.meta.env.DEV) {
    console.warn('Allowing access to protected route in development without authentication');
    return <Outlet />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
