import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, Save, AlertCircle } from "lucide-react";
import { workflowExecutionService } from "@/lib/workflowExecutionService";

export default function SimpleWorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState("New Workflow");
  const [workflowDescription, setWorkflowDescription] =
    useState("A simple workflow");
  const [userQuery, setUserQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("editor");
  const [workflowType, setWorkflowType] = useState("rag");

  const executeWorkflow = async () => {
    if (!userQuery.trim()) return;

    setIsExecuting(true);
    setExecutionResults(null);
    setExecutionLogs([]);

    try {
      // Create a workflow based on the selected type
      let workflow;

      if (workflowType === "rag") {
        workflow = {
          id: "workflow-1",
          name: workflowName,
          nodes: [
            {
              id: "input-1",
              type: "input",
              position: { x: 100, y: 100 },
              data: {
                label: "User Input",
                variableName: "userQuery",
                dataType: "string",
                value: userQuery,
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
                prompt: `Based on the retrieved documents, please answer: ${userQuery}`,
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
        };
      } else if (workflowType === "web-search") {
        workflow = {
          id: "workflow-1",
          name: workflowName,
          nodes: [
            {
              id: "input-1",
              type: "input",
              position: { x: 100, y: 100 },
              data: {
                label: "User Query",
                variableName: "userQuery",
                dataType: "string",
                value: userQuery,
              },
            },
            {
              id: "web-search-1",
              type: "web-search",
              position: { x: 100, y: 250 },
              data: {
                label: "Web Search",
                description: "Searches the web for information",
                query: userQuery,
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
                prompt: `Using the following web search results, please answer: ${userQuery}`,
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
        };
      }

      // Execute the workflow
      const result = await workflowExecutionService.executeWorkflow(workflow, {
        onNodeStart: (nodeId) => {
          setExecutionLogs((logs) => [...logs, `Starting node: ${nodeId}`]);
        },
        onNodeComplete: (nodeId, output) => {
          setExecutionLogs((logs) => [...logs, `Completed node: ${nodeId}`]);
        },
        onNodeError: (nodeId, error) => {
          setExecutionLogs((logs) => [
            ...logs,
            `Error in node ${nodeId}: ${error}`,
          ]);
        },
        onLogUpdate: (log) => {
          setExecutionLogs((logs) => [...logs, log]);
        },
        onWorkflowComplete: (result) => {
          setExecutionResults(result);
        },
      });

      setExecutionResults(result);
      setActiveTab("results");
    } catch (error) {
      console.error("Workflow execution error:", error);
      setExecutionLogs((logs) => [
        ...logs,
        `Workflow execution error: ${error.message}`,
      ]);
      setExecutionResults({
        success: false,
        error: error.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const saveWorkflow = () => {
    // Create a workflow object
    const workflow = {
      id: `workflow-${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      type: workflowType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Get existing workflows from localStorage
    const existingWorkflows = JSON.parse(
      localStorage.getItem("workflows") || "[]",
    );

    // Add new workflow
    const updatedWorkflows = [...existingWorkflows, workflow];

    // Save to localStorage
    localStorage.setItem("workflows", JSON.stringify(updatedWorkflows));

    alert("Workflow saved successfully!");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Simple Workflow Builder</h1>
          <p className="text-muted-foreground">
            Create and test automated workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveWorkflow}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Settings</CardTitle>
                <CardDescription>Configure your workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-description">Description</Label>
                  <Textarea
                    id="workflow-description"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-type">Workflow Type</Label>
                  <Select value={workflowType} onValueChange={setWorkflowType}>
                    <SelectTrigger id="workflow-type">
                      <SelectValue placeholder="Select workflow type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rag">RAG Workflow</SelectItem>
                      <SelectItem value="web-search">
                        Web Search Workflow
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Execute Workflow</CardTitle>
                <CardDescription>
                  {workflowType === "rag"
                    ? "Run a RAG workflow to answer questions using your knowledge base"
                    : "Run a web search workflow to answer questions using internet search"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="user-query">Your Question</Label>
                  <Textarea
                    id="user-query"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Enter your question here..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={executeWorkflow}
                  disabled={isExecuting || !userQuery.trim()}
                  className="w-full"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Workflow
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-[400px] overflow-y-auto">
                  {executionLogs.length > 0 ? (
                    executionLogs.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))
                  ) : (
                    <div className="text-gray-500">
                      No logs yet. Execute the workflow to see logs.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {executionResults ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${executionResults.success ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span>
                        {executionResults.success
                          ? "Execution Successful"
                          : "Execution Failed"}
                      </span>
                    </div>

                    <div className="text-sm mb-2">
                      Execution Time: {executionResults.executionTime}
                    </div>

                    {executionResults.error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {executionResults.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {executionResults.output &&
                      Object.keys(executionResults.output).length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Answer:</h4>
                          <div className="bg-muted p-4 rounded-md">
                            {executionResults.output.response ? (
                              <p>
                                {executionResults.output.response.text ||
                                  executionResults.output.response}
                              </p>
                            ) : (
                              <pre className="whitespace-pre-wrap text-sm">
                                {JSON.stringify(
                                  executionResults.output,
                                  null,
                                  2,
                                )}
                              </pre>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>
                      No execution results yet. Execute the workflow to see
                      results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
