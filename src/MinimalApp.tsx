import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useRoutes,
} from "react-router-dom";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { ChatProvider } from "@/context/ChatContext";
import { WorkflowProvider } from "@/context/WorkflowContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import routes from "./tempo-routes";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { initDatabase } from "@/lib/db/sqlite";

// Import pages
import Index from "@/pages/Index";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Documents from "@/pages/Documents";
import DocumentKnowledgeBase from "@/pages/DocumentKnowledgeBase";
import DocumentSettings from "@/pages/DocumentSettings";
import Templates from "@/pages/Templates";
import FineTuning from "@/pages/FineTuning";
import WorkflowManagement from "@/pages/WorkflowManagement";
import { WorkflowBuilderPage } from "@/pages/WorkflowBuilder";
import NotFound from "@/pages/NotFound";
import FallbackPage from "@/pages/FallbackPage";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 animate-pulse">
            <div className="text-primary text-xl font-bold">AI</div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

interface MinimalAppProps {
  tempoEnabled?: boolean;
}

const MinimalApp = ({ tempoEnabled }: MinimalAppProps) => {
  // Initialize database when app loads
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };

    init();
  }, []);

  return (
    <AuthProvider>
      <UserPreferencesProvider>
        <WorkspaceProvider>
          <ChatProvider>
            <WorkflowProvider>
              <Router>
                <Layout>
                  <Routes>
                    {/* Add Tempo routes if enabled */}
                    {tempoEnabled && (
                      <Route
                        path="/tempobook/*"
                        element={<div>Tempo Storybook</div>}
                      />
                    )}
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chat"
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/documents"
                      element={
                        <ProtectedRoute>
                          <Documents />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/knowledge-base"
                      element={
                        <ProtectedRoute>
                          <DocumentKnowledgeBase />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/document-settings"
                      element={
                        <ProtectedRoute>
                          <DocumentSettings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/templates"
                      element={
                        <ProtectedRoute>
                          <Templates />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/fine-tuning"
                      element={
                        <ProtectedRoute>
                          <FineTuning />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/workflows"
                      element={
                        <ProtectedRoute>
                          <WorkflowManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/workflow-builder"
                      element={
                        <ProtectedRoute>
                          <WorkflowBuilderPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/workflow-builder/:id"
                      element={
                        <ProtectedRoute>
                          <WorkflowBuilderPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>

                {/* Global Components */}
                <Toaster />
                <SonnerToaster />
                {/* KeyboardShortcuts already included in Layout component */}
              </Router>
            </WorkflowProvider>
          </ChatProvider>
        </WorkspaceProvider>
      </UserPreferencesProvider>
    </AuthProvider>
  );
};

export default MinimalApp;
