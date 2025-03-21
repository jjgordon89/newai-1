import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import DependencyChecker from "./DependencyChecker";
import ApiIntegrationTester from "./ApiIntegrationTester";
import {
  Calculator,
  Clock,
  Database,
  MessageSquare,
  Workflow,
  FileText,
  Search,
} from "lucide-react";

export default function FunctionalityDashboard() {
  const [activeTab, setActiveTab] = useState("dependencies");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          AI Assistant Functionality Dashboard
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Explore and test all the features and dependencies of the AI Assistant
          application
        </p>
      </div>

      <Tabs
        defaultValue="dependencies"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-8 w-full max-w-4xl mx-auto">
          <TabsTrigger value="dependencies" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dependencies
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            API Testing
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            AI Skills
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dependencies" className="mt-0">
          <DependencyChecker />
        </TabsContent>

        <TabsContent value="api" className="mt-0">
          <ApiIntegrationTester />
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">AI Skills</h2>
              <p className="text-muted-foreground mb-6">
                Test the various AI skills and capabilities available in the
                application.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Calculator</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Perform mathematical calculations through natural language.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Test Calculator
                  </Button>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Time & Date</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get current time, date, and timezone information.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Test Time Skill
                  </Button>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Document Processing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Process and analyze PDF, Excel, and text documents.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Test Document Processing
                  </Button>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Enhanced Chat</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test the enhanced chat capabilities with context awareness.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Test Chat Enhancement
                  </Button>
                </Card>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="mt-0">
          <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Workflow Testing</h2>
              <p className="text-muted-foreground mb-6">
                Test the workflow builder and execution capabilities.
              </p>

              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-4">
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-2">Simple RAG Workflow</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      A workflow that uses retrieval augmented generation.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm">Run Test</Button>
                    </div>
                  </Card>

                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-2">Web Search Agent</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      A workflow that enhances responses with web search
                      results.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm">Run Test</Button>
                    </div>
                  </Card>

                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-2">Agent Chain</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      A workflow that chains multiple agent calls together.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm">Run Test</Button>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
