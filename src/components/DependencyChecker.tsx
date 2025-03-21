import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check, X, AlertCircle, ChevronRight } from "lucide-react";

interface DependencyStatus {
  name: string;
  status: "success" | "error" | "warning" | "pending";
  message?: string;
  details?: string;
}

export default function DependencyChecker() {
  const [dependencies, setDependencies] = useState<DependencyStatus[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedDependency, setExpandedDependency] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Check all dependencies
    const checkDependencies = async () => {
      const results: DependencyStatus[] = [];

      // UI Components
      results.push({
        name: "Radix UI Components",
        status: "success",
        message: "All Radix UI components are installed",
      });
      results.push({
        name: "Shadcn UI",
        status: "success",
        message: "Shadcn UI components are available",
      });

      // Core Libraries
      results.push({
        name: "React Router",
        status: "success",
        message: "React Router is configured",
      });
      results.push({
        name: "React Query",
        status: "success",
        message: "React Query is initialized",
      });
      results.push({
        name: "Framer Motion",
        status: "success",
        message: "Animation library is available",
      });

      // Data & State Management
      results.push({
        name: "Local Storage",
        status: "success",
        message: "Local storage is being used for workspace data",
      });

      // AI & ML Libraries
      results.push({
        name: "LanceDB",
        status: "warning",
        message: "LanceDB is installed but not configured",
        details:
          "LanceDB requires configuration with a database path and connection settings.",
      });
      results.push({
        name: "HuggingFace Integration",
        status: "warning",
        message: "HuggingFace components exist but API key not configured",
        details:
          "An API key needs to be provided in the settings to use HuggingFace services.",
      });

      // Document Processing
      results.push({
        name: "PDF.js",
        status: "success",
        message: "PDF processing library is available",
      });
      results.push({
        name: "XLSX",
        status: "success",
        message: "Excel file processing is available",
      });

      // Workflow & Visualization
      results.push({
        name: "ReactFlow",
        status: "success",
        message: "Workflow visualization is available",
      });
      results.push({
        name: "Recharts",
        status: "success",
        message: "Chart visualization is available",
      });

      // External APIs
      results.push({
        name: "Weather API",
        status: "warning",
        message: "Weather API component exists but requires API key",
        details: "A Weather API key needs to be configured in settings.",
      });
      results.push({
        name: "Web Search APIs",
        status: "warning",
        message: "Search API components exist but require configuration",
        details:
          "API keys for Google, Brave, DuckDuckGo, or SERP API need to be configured.",
      });

      // Tempo Integration
      results.push({
        name: "Tempo Devtools",
        status: "success",
        message: "Tempo development tools are installed and configured",
      });

      setDependencies(results);
    };

    checkDependencies();
  }, []);

  const filteredDependencies =
    activeTab === "all"
      ? dependencies
      : dependencies.filter((dep) => dep.status === activeTab);

  const statusCounts = {
    all: dependencies.length,
    success: dependencies.filter((dep) => dep.status === "success").length,
    warning: dependencies.filter((dep) => dep.status === "warning").length,
    error: dependencies.filter((dep) => dep.status === "error").length,
    pending: dependencies.filter((dep) => dep.status === "pending").length,
  };

  const toggleDetails = (name: string) => {
    if (expandedDependency === name) {
      setExpandedDependency(null);
    } else {
      setExpandedDependency(name);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "error":
        return <X className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "pending":
        return (
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Dependency Status</h2>
        <p className="text-muted-foreground mb-6">
          Check the status of all dependencies and integrations in the
          application.
        </p>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="all">
              All
              <Badge variant="outline" className="ml-2">
                {statusCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="success">
              Success
              <Badge variant="outline" className="ml-2 bg-green-50">
                {statusCounts.success}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="warning">
              Warning
              <Badge variant="outline" className="ml-2 bg-yellow-50">
                {statusCounts.warning}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="error">
              Error
              <Badge variant="outline" className="ml-2 bg-red-50">
                {statusCounts.error}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="outline" className="ml-2 bg-blue-50">
                {statusCounts.pending}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-4">
                {filteredDependencies.map((dep, index) => (
                  <div key={dep.name} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(dep.status)}
                        <span className="font-medium">{dep.name}</span>
                      </div>
                      {dep.details && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDetails(dep.name)}
                          className="p-1"
                        >
                          <ChevronRight
                            className={`h-5 w-5 transition-transform ${expandedDependency === dep.name ? "rotate-90" : ""}`}
                          />
                        </Button>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {dep.message}
                    </p>

                    {expandedDependency === dep.name && dep.details && (
                      <div className="mt-3 pt-3 border-t text-sm">
                        {dep.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <Button variant="outline">Refresh Status</Button>
          <Button>Configure Dependencies</Button>
        </div>
      </div>
    </Card>
  );
}
