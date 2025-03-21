import React, { useState } from "react";
import WorkflowBuilder from "@/components/workflow/WorkflowBuilder";
import WorkflowRunner from "@/components/workflow/WorkflowRunner";
import { Node, Edge } from "reactflow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WorkflowBuilderPage: React.FC = () => {
  // Sample initial nodes and edges for demonstration
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "trigger-1",
      type: "trigger",
      position: { x: 100, y: 200 },
      data: { label: "Start Workflow", triggerType: "manual" },
    },
    {
      id: "llm-1",
      type: "llm",
      position: { x: 400, y: 100 },
      data: {
        label: "Query Processor",
        model: "gpt-4",
        systemPrompt: "Extract the main query intent from the user input.",
      },
    },
    {
      id: "rag-1",
      type: "rag",
      position: { x: 400, y: 300 },
      data: {
        label: "Knowledge Retrieval",
        knowledgeBase: "documentation",
        topK: 5,
      },
    },
    {
      id: "agent-1",
      type: "agent",
      position: { x: 700, y: 200 },
      data: {
        label: "Research Agent",
        agentType: "react",
        tools: { webSearch: true, knowledgeBase: true },
      },
    },
    {
      id: "output-1",
      type: "output",
      position: { x: 1000, y: 200 },
      data: { label: "Final Response", outputType: "text" },
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: "e1-2", source: "trigger-1", target: "llm-1" },
    { id: "e1-3", source: "trigger-1", target: "rag-1" },
    { id: "e2-4", source: "llm-1", target: "agent-1" },
    { id: "e3-4", source: "rag-1", target: "agent-1" },
    { id: "e4-5", source: "agent-1", target: "output-1" },
  ]);

  const handleSave = (updatedNodes: Node[], updatedEdges: Edge[]) => {
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    console.log("Workflow saved:", {
      nodes: updatedNodes,
      edges: updatedEdges,
    });
    // In a real implementation, you would save to a database or file
  };

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-6">AI Agent Workflow Builder</h1>

      <Tabs defaultValue="builder" className="h-[calc(100%-4rem)]">
        <TabsList className="mb-4">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="runner">Runner</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="h-full">
          <div className="bg-card rounded-lg border shadow-sm h-full">
            <WorkflowBuilder
              initialNodes={nodes}
              initialEdges={edges}
              onSave={handleSave}
            />
          </div>
        </TabsContent>

        <TabsContent value="runner" className="h-full">
          <div className="bg-card rounded-lg border shadow-sm p-6 h-full">
            <WorkflowRunner nodes={nodes} edges={edges} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowBuilderPage;
