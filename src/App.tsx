
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Experiments from "@/pages/Experiments";
import ExperimentDetails from "@/pages/ExperimentDetails";
import ExperimentNotes from "@/pages/ExperimentNotes";
import ExperimentIdeas from "@/pages/ExperimentIdeas";
import IdeaNotes from "@/pages/IdeaNotes";
import Projects from "@/pages/Projects";
import ProjectExperiments from "@/pages/ProjectExperiments";
import Protocols from "@/pages/Protocols";
import ProtocolDetails from "@/pages/ProtocolDetails";
import Calendar from "@/pages/Calendar";
import Tasks from "@/pages/Tasks";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";
import Inventory from "@/pages/Inventory";
import LabelPrinter from "@/pages/LabelPrinter";
import Orders from "@/pages/Orders";
import Messages from "@/pages/Messages";
import VideoChat from "@/pages/VideoChat";
import Team from "@/pages/Team";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import SystemSettings from "@/pages/SystemSettings";
import NotFound from "@/pages/NotFound";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
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
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/experiments" element={
                <ProtectedRoute>
                  <Layout>
                    <Experiments />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/experiments/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <ExperimentDetails />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/experiments/:id/notes" element={
                <ProtectedRoute>
                  <Layout>
                    <ExperimentNotes />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/experiment-ideas" element={
                <ProtectedRoute>
                  <Layout>
                    <ExperimentIdeas />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/experiment-ideas/:id/notes" element={
                <ProtectedRoute>
                  <Layout>
                    <IdeaNotes />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Layout>
                    <Projects />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:id/experiments" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectExperiments />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/protocols" element={
                <ProtectedRoute>
                  <Layout>
                    <Protocols />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/protocols/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <ProtocolDetails />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Layout>
                    <Calendar />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <Layout>
                    <Tasks />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <Layout>
                    <Inventory />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/labels" element={
                <ProtectedRoute>
                  <Layout>
                    <LabelPrinter />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Layout>
                    <Orders />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/video-chat" element={
                <ProtectedRoute>
                  <Layout>
                    <VideoChat />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/team" element={
                <ProtectedRoute>
                  <Layout>
                    <Team />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <SystemSettings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
