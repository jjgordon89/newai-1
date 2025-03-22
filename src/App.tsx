import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MinimalApp from "./MinimalApp";
import ErrorBoundary from "./components/ErrorBoundary";
import { performanceMonitoring } from "./lib/monitoring/performanceMonitoringService";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize local storage with required default values on app start
  useEffect(() => {
    console.log("App initializing...");

    // Create default workspace if needed
    const savedWorkspaces = localStorage.getItem("workspaces");
    if (!savedWorkspaces || JSON.parse(savedWorkspaces).length === 0) {
      console.log("Creating default workspace");
      const defaultWorkspace = {
        id: crypto.randomUUID(),
        name: "My Workspace",
        description: "Default workspace",
        createdAt: new Date().toISOString(),
        settings: {
          models: {
            embeddingModel: "BAAI/bge-small-en-v1.5",
            useHuggingFaceEmbeddings: true,
          },
          rag: {
            chunkSize: 1024,
            chunkOverlap: 200,
            chunkingStrategy: "hybrid",
            topK: 3,
            similarityThreshold: 70,
            retrieverStrategy: "hybrid",
          },
        },
      };
      localStorage.setItem("workspaces", JSON.stringify([defaultWorkspace]));
      localStorage.setItem("activeWorkspaceId", defaultWorkspace.id);
    }

    // Create default chat for workspace
    const workspaces = JSON.parse(localStorage.getItem("workspaces") || "[]");
    const activeWorkspaceId = localStorage.getItem("activeWorkspaceId");
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");

    if (
      workspaces.length > 0 &&
      activeWorkspaceId &&
      !chats.some((chat) => chat.workspaceId === activeWorkspaceId)
    ) {
      console.log("Creating default chat");
      const newChat = {
        id: crypto.randomUUID(),
        title: "New Chat",
        workspaceId: activeWorkspaceId,
        messages: [
          {
            id: crypto.randomUUID(),
            role: "system",
            content:
              "You are a helpful, friendly, and knowledgeable AI assistant. Answer questions accurately and helpfully.",
            timestamp: new Date().toISOString(),
            workspaceId: activeWorkspaceId,
          },
        ],
      };

      localStorage.setItem("chats", JSON.stringify([...chats, newChat]));
      localStorage.setItem("activeChatId", newChat.id);
    }

    // Create default workflows
    const workflows = JSON.parse(localStorage.getItem("workflows") || "[]");
    if (workflows.length === 0) {
      console.log("Creating example workflow");
      // Create example workflows with different categories
      const exampleWorkflows = [
        {
          id: crypto.randomUUID(),
          name: "Simple RAG Workflow",
          description: "A workflow that uses retrieval augmented generation",
          category: "AI Agents",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nodes: [
            {
              id: "input-1",
              type: "input",
              position: { x: 100, y: 100 },
              data: {
                label: "User Input",
                variableName: "userQuery",
                dataType: "string",
              },
            },
            {
              id: "rag-1",
              type: "rag",
              position: { x: 100, y: 250 },
              data: {
                label: "RAG Retrieval",
                description: "Retrieves relevant documents",
                retrievalMethod: "similarity",
                topK: 3,
                documents: [],
              },
            },
            {
              id: "llm-1",
              type: "llm",
              position: { x: 100, y: 400 },
              data: {
                label: "LLM Processing",
                description:
                  "Generates a response based on retrieved documents",
                model: "gpt-4",
                prompt:
                  "Based on the retrieved documents, please answer: {{userQuery}}",
                temperature: 0.7,
              },
            },
            {
              id: "output-1",
              type: "output",
              position: { x: 100, y: 550 },
              data: {
                label: "Final Response",
                variableName: "response",
                dataType: "string",
                description: "The final response to send back to the user",
              },
            },
          ],
          edges: [
            {
              id: "edge-input-rag",
              source: "input-1",
              target: "rag-1",
              type: "default",
            },
            {
              id: "edge-rag-llm",
              source: "rag-1",
              target: "llm-1",
              type: "default",
            },
            {
              id: "edge-llm-output",
              source: "llm-1",
              target: "output-1",
              type: "default",
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Web Search Agent",
          description:
            "A workflow that enhances responses with web search results",
          category: "Search",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nodes: [
            {
              id: "input-1",
              type: "input",
              position: { x: 100, y: 100 },
              data: {
                label: "User Query",
                variableName: "userQuery",
                dataType: "string",
              },
            },
            {
              id: "web-search-1",
              type: "web-search",
              position: { x: 100, y: 250 },
              data: {
                label: "Web Search",
                description: "Searches the web for information",
                query: "{{userQuery}}",
                resultCount: 5,
              },
            },
            {
              id: "llm-1",
              type: "llm",
              position: { x: 100, y: 400 },
              data: {
                label: "LLM Processing",
                description: "Analyzes search results and generates a response",
                model: "gpt-4",
                prompt:
                  "Using the following web search results, please answer: {{userQuery}}\n\nSearch Results:\n{{web-search-1.results}}",
                temperature: 0.7,
              },
            },
            {
              id: "output-1",
              type: "output",
              position: { x: 100, y: 550 },
              data: {
                label: "Final Response",
                variableName: "response",
                dataType: "string",
                description: "The final response to send back to the user",
              },
            },
          ],
          edges: [
            {
              id: "edge-input-search",
              source: "input-1",
              target: "web-search-1",
              type: "default",
            },
            {
              id: "edge-search-llm",
              source: "web-search-1",
              target: "llm-1",
              type: "default",
            },
            {
              id: "edge-llm-output",
              source: "llm-1",
              target: "output-1",
              type: "default",
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Agent Chain",
          description: "A workflow that chains multiple agent calls together",
          category: "Advanced",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nodes: [],
          edges: [],
        },
      ];

      localStorage.setItem("workflows", JSON.stringify(exampleWorkflows));
    }

    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 animate-pulse">
            <div className="text-primary text-xl font-bold">AI</div>
          </div>
          <p className="mt-4 text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Handle errors caught by ErrorBoundary
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a production app, you might send this to an error reporting service
    console.error("Application error:", error, errorInfo);
    
    // Track the error in performance monitoring
    performanceMonitoring.trackMetric({
      id: `app_error_${Date.now()}`,
      type: 'custom',
      name: `App Error: ${error.name}`,
      startTime: performance.now(),
      duration: 0,
      metadata: {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <QueryClientProvider client={queryClient}>
        <MinimalApp tempoEnabled={import.meta.env.VITE_TEMPO} />
        {/* Toaster components moved to MinimalApp to prevent duplication */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
