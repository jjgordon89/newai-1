import React from "react";
import AgentWorkflowBuilder from "@/components/workflow/AgentWorkflowBuilder";

const AgentWorkflowBuilderPage: React.FC = () => {
  // Sample initial nodes and edges for demonstration
  const initialNodes = [
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
  ];

  const initialEdges = [
    { id: "e1-2", source: "trigger-1", target: "llm-1" },
    { id: "e1-3", source: "trigger-1", target: "rag-1" },
    { id: "e2-4", source: "llm-1", target: "agent-1" },
    { id: "e3-4", source: "rag-1", target: "agent-1" },
    { id: "e4-5", source: "agent-1", target: "output-1" },
  ];

  const handleSave = (nodes: any[], edges: any[]) => {
    console.log("Workflow saved:", { nodes, edges });
    // In a real implementation, you would save to a database or file
  };

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-6">AI Agent Workflow Builder</h1>
      <div className="bg-card rounded-lg border shadow-sm h-[calc(100%-4rem)]">
        <AgentWorkflowBuilder
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default AgentWorkflowBuilderPage;
