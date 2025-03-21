import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Workflow,
  FileText,
  Database,
  BrainCircuit,
  Settings,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function Index() {
  const { workspaces, activeWorkspaceId } = useWorkspace();
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to AI Platform</h1>
          <p className="text-muted-foreground">
            Build and deploy AI workflows, manage knowledge bases, and fine-tune
            models
          </p>
        </div>

        <Button asChild>
          <Link to="/profile">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>

      {activeWorkspace && (
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Active Workspace: {activeWorkspace.name}</CardTitle>
            <CardDescription>
              {activeWorkspace.description || "No description"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Documents</div>
                  <div className="text-sm text-muted-foreground">
                    {activeWorkspace.documents?.length || 0} document(s)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Model</div>
                  <div className="text-sm text-muted-foreground">
                    {activeWorkspace.llmConfig?.model || "Default model"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Settings</div>
                  <div className="text-sm text-muted-foreground">
                    {Object.keys(activeWorkspace.settings || {}).length || 0}{" "}
                    configuration(s)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Workflow Builder
            </CardTitle>
            <CardDescription>
              Build and deploy AI agent workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create custom AI workflows with our visual editor. Connect
              different components to build powerful agent processes.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/workflow-builder">
                Open Workflow Builder
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Knowledge Base
            </CardTitle>
            <CardDescription>
              Manage your documents and knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload and manage documents to create a knowledge base for your AI
              agents. Enhance your AI with domain-specific information.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/knowledge-base">
                Open Knowledge Base
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              Fine-Tuning
            </CardTitle>
            <CardDescription>
              Create and manage fine-tuned models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fine-tune foundation models on your custom data to improve
              performance on specific tasks and domains.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/fine-tuning">
                Open Fine-Tuning
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Functionality Dashboard
            </CardTitle>
            <CardDescription>Test and explore all app features</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check dependencies, test API integrations, and explore all
              available functionality in the application.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="default">
              <Link to="/functionality">
                Open Dashboard
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
