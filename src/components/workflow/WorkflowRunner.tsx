import React, { useState } from "react";
import { Node, Edge } from "reactflow";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Play, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { executeWorkflow } from "@/lib/workflow/langchainIntegration";

interface WorkflowRunnerProps {
  nodes: Node[];
  edges: Edge[];
  className?: string;
}

const WorkflowRunner: React.FC<WorkflowRunnerProps> = ({
  nodes,
  edges,
  className = "",
}) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("input");

  const handleRun = async () => {
    if (!input.trim()) {
      setError("Please provide an input");
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput(null);
    setActiveTab("output");

    try {
      const result = await executeWorkflow(nodes, edges, input);
      setOutput(result);
    } catch (err) {
      console.error("Workflow execution error:", err);
      setError(err.message || "An error occurred while executing the workflow");
    } finally {
      setIsRunning(false);
    }
  };

  const formatOutput = (data: any) => {
    if (!data) return "No output";

    try {
      if (typeof data === "string") return data;

      // Handle different output formats
      if (data.output) return data.output;
      if (data.text) return data.text;
      if (data.result) return data.result;

      // For output nodes, we might have multiple outputs
      const formattedOutput = Object.entries(data)
        .map(([nodeId, nodeOutput]: [string, any]) => {
          const nodeName =
            nodes.find((n) => n.id === nodeId)?.data?.label || nodeId;
          const outputText =
            nodeOutput.output ||
            nodeOutput.text ||
            JSON.stringify(nodeOutput, null, 2);
          return `--- ${nodeName} ---\n${outputText}`;
        })
        .join("\n\n");

      return formattedOutput || JSON.stringify(data, null, 2);
    } catch (e) {
      return JSON.stringify(data, null, 2);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Workflow Runner
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-4 mt-4">
              <Textarea
                placeholder="Enter your input here..."
                className="min-h-[200px]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="output" className="mt-4">
              {isRunning ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <p className="text-muted-foreground">Executing workflow...</p>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : output ? (
                <div className="relative">
                  <Textarea
                    className="min-h-[200px] font-mono text-sm"
                    value={formatOutput(output)}
                    readOnly
                  />
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Run the workflow to see output</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            onClick={handleRun}
            disabled={isRunning || !input.trim()}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run Workflow
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkflowRunner;
