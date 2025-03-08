
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { checkConnection } from '@/lib/mongodb';
import { Loader2 } from 'lucide-react';

const PrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For now, we'll just check if MongoDB is connected
        // In a real app, you'd check user authentication here
        const connected = await checkConnection();
        setIsConnected(connected);
      } catch (error) {
        console.error('Error checking connection:', error);
        setIsConnected(false);
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
  if (!isConnected && import.meta.env.DEV) {
    console.warn('Allowing access to protected route in development without authentication');
    return <Outlet />;
  }

  // For simplicity in this demo, we'll always allow access if connected to MongoDB
  // In a real app, you'd check if the user is authenticated
  return isConnected || import.meta.env.DEV ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
