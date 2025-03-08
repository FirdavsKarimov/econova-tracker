
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
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient();

const App = () => {
  // Setup Supabase tables on initial load
  useEffect(() => {
    const setupSupabase = async () => {
      // This would typically be done in migrations or via the Supabase dashboard
      console.log('Checking Supabase connection...');
      const { data, error } = await supabase.from('expenses').select('count').single();
      if (error && error.code === 'PGRST116') {
        console.log('Tables might need to be created in Supabase dashboard');
      }
    };

    setupSupabase();
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
