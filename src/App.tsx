
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Experiments from "./pages/Experiments";
import ExperimentNotes from "./pages/ExperimentNotes";
import ExperimentIdeas from "./pages/ExperimentIdeas";
import IdeaNotes from "./pages/IdeaNotes";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import ProjectExperiments from "./pages/ProjectExperiments";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Inventory from "./pages/Inventory";
import LabelPrinter from "./pages/LabelPrinter";
import Orders from "./pages/Orders";
import Messages from "./pages/Messages";
import VideoChat from "./pages/VideoChat";
import Team from "./pages/Team";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import SystemSettings from "./pages/SystemSettings";
import NotFound from "./pages/NotFound";
import Protocols from "./pages/Protocols";
import ProtocolDetails from "./pages/ProtocolDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/experiments" element={
              <ProtectedRoute>
                <Experiments />
              </ProtectedRoute>
            } />
            <Route path="/experiments/:experimentId/notes" element={
              <ProtectedRoute>
                <ExperimentNotes />
              </ProtectedRoute>
            } />
            <Route path="/experiment-ideas" element={
              <ProtectedRoute>
                <ExperimentIdeas />
              </ProtectedRoute>
            } />
            <Route path="/experiment-ideas/:ideaId/notes" element={
              <ProtectedRoute>
                <IdeaNotes />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/experiments" element={
              <ProtectedRoute>
                <ProjectExperiments />
              </ProtectedRoute>
            } />
            <Route path="/protocols" element={
              <ProtectedRoute>
                <Protocols />
              </ProtectedRoute>
            } />
            <Route path="/protocols/:protocolId" element={
              <ProtectedRoute>
                <ProtocolDetails />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/labels" element={
              <ProtectedRoute>
                <LabelPrinter />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/video-chat" element={
              <ProtectedRoute>
                <VideoChat />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <SystemSettings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
