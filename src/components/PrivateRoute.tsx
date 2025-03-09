
import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { checkConnection } from '@/lib/mongodb';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const PrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a MongoDB connection
        const connected = await checkConnection();
        
        if (connected) {
          // If connected, we can fetch the user through our supabase stub
          const { data } = await supabase.auth.getUser();
          setIsAuthenticated(!!data.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // In development mode, allow access to protected routes even without auth
  if (!isAuthenticated && import.meta.env.DEV) {
    console.warn('Allowing access to protected route in development without authentication');
    return <Outlet />;
  }

  return isAuthenticated || import.meta.env.DEV ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;
