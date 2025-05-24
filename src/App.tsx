
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Experiments from "./pages/Experiments";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/projects" element={<Index />} />
          <Route path="/tasks" element={<Index />} />
          <Route path="/analytics" element={<Index />} />
          <Route path="/reports" element={<Index />} />
          <Route path="/inventory" element={<Index />} />
          <Route path="/labels" element={<Index />} />
          <Route path="/orders" element={<Index />} />
          <Route path="/messages" element={<Index />} />
          <Route path="/video-chat" element={<Index />} />
          <Route path="/team" element={<Index />} />
          <Route path="/settings" element={<Index />} />
          <Route path="/admin/users" element={<Index />} />
          <Route path="/admin/settings" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
