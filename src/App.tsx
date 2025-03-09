
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/Dashboard";
import BudgetPage from "./pages/Budget";
import ExpensesPage from "./pages/Expenses";
import GoalsPage from "./pages/Goals";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import { useEffect } from "react";
import { checkConnection } from "./lib/mongodb";
import { toast } from "@/components/ui/use-toast";

const queryClient = new QueryClient();

const App = () => {
  // Setup MongoDB connection on initial load
  useEffect(() => {
    const setupMongoDB = async () => {
      try {
        const connected = await checkConnection();
        if (connected) {
          console.log('Successfully connected to MongoDB');
        } else {
          console.warn('Running in development mode without MongoDB connection');
          toast({
            title: "Database Connection",
            description: "Unable to connect to MongoDB. Using mock data.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error during MongoDB setup:', error);
        toast({
          title: "Database Error",
          description: "Failed to connect to the database. Using mock data.",
          variant: "destructive",
        });
      }
    };

    setupMongoDB();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
