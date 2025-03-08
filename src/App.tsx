
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
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
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Index />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
