import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeTypes,
  Panel,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Save,
  Play,
  Download,
  Upload,
  Trash2,
  Settings,
  Zap,
  Database,
  Search,
  MessageSquare,
} from "lucide-react";

// Import custom node components
import AgentNode from "./nodes/AgentNode";
import LLMNode from "./nodes/LLMNode";
import RAGNode from "./nodes/RAGNode";
import WebSearchNode from "./nodes/WebSearchNode";
import TriggerNode from "./nodes/TriggerNode";
import OutputNode from "./nodes/OutputNode";
import NodePalette from "./NodePalette";
import NodeConfigPanel from "./NodeConfigPanel";

// Define node types
const nodeTypes: NodeTypes = {
  agent: AgentNode,
  llm: LLMNode,
  rag: RAGNode,
  webSearch: WebSearchNode,
  trigger: TriggerNode,
  output: OutputNode,
};

interface AgentWorkflowBuilderProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  readOnly?: boolean;
  className?: string;
}

const AgentWorkflowBuilder: React.FC<AgentWorkflowBuilderProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
  readOnly = false,
  className = "",
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState("nodes");
  const [workflowName, setWorkflowName] = useState("New Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const { project } = useReactFlow();

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setActiveTab("config");
  }, []);

  // Handle node deselection when clicking on the canvas
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Handle dropping a new node onto the canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (reactFlowWrapper.current) {
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const nodeType = event.dataTransfer.getData(
          "application/reactflow/type",
        );
        const nodeLabel = event.dataTransfer.getData(
          "application/reactflow/label",
        );

        // Check if the dropped element is valid
        if (!nodeType || !nodeTypes[nodeType as keyof typeof nodeTypes]) {
          return;
        }

        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Create a unique ID for the new node
        const newNodeId = `${nodeType}-${Date.now()}`;

        // Create the new node
        const newNode: Node = {
          id: newNodeId,
          type: nodeType,
          position,
          data: {
            label:
              nodeLabel ||
              `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`,
          },
        };

        // Add the new node to the graph
        setNodes((nds) => nds.concat(newNode));

        // Select the newly created node
        setSelectedNode(newNode);
        setActiveTab("config");
      }
    },
    [project, setNodes],
  );

  // Handle drag over event
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Update node data when configuration changes
  const onNodeConfigChange = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...newData },
            };
          }
          return node;
        }),
      );
    },
    [setNodes],
  );

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id,
        ),
      );
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // Save the workflow
  const saveWorkflow = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
    // In a real implementation, you would also save to a database or file
    console.log("Workflow saved:", {
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
    });
  }, [nodes, edges, workflowName, workflowDescription, onSave]);

  // Export workflow as JSON
  const exportWorkflow = useCallback(() => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
    };
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `${workflowName.replace(/\s+/g, "_").toLowerCase()}_workflow.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [workflowName, workflowDescription, nodes, edges]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <div>
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-semibold border-none focus-visible:ring-0 px-0"
              placeholder="Workflow Name"
              disabled={readOnly}
            />
            <p className="text-sm text-muted-foreground">
              {nodes.length} nodes · {edges.length} connections
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!readOnly && (
            <>
              <Button variant="outline" size="sm" onClick={exportWorkflow}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
              <Button variant="default" size="sm" onClick={saveWorkflow}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="default" size="sm">
                <Play className="h-4 w-4 mr-1" />
                Run
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r p-4 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nodes">Nodes</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>
            <TabsContent value="nodes" className="mt-4">
              <NodePalette disabled={readOnly} />
            </TabsContent>
            <TabsContent value="config" className="mt-4">
              {selectedNode ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">
                      Configure {selectedNode.data.label || selectedNode.type}
                    </h3>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deleteSelectedNode}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <NodeConfigPanel
                    node={selectedNode}
                    onChange={(newData) =>
                      onNodeConfigChange(selectedNode.id, newData)
                    }
                    readOnly={readOnly}
                  />
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select a node to configure</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
              minZoom={0.2}
              maxZoom={4}
              defaultEdgeOptions={{
                animated: true,
                style: { stroke: "#64748b", strokeWidth: 2 },
              }}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={!readOnly}
              nodesConnectable={!readOnly}
              elementsSelectable={!readOnly}
              zoomOnScroll={!readOnly}
              panOnScroll={!readOnly}
              className="bg-background"
            >
              <Background color="#94a3b8" gap={16} size={1} />
              <Controls showInteractive={!readOnly} />
              <MiniMap nodeStrokeWidth={3} zoomable pannable />

              {!readOnly && (
                <Panel
                  position="top-right"
                  className="bg-background/80 p-2 rounded-md shadow-md backdrop-blur-sm"
                >
                  <div className="flex flex-col gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">Add Node</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={saveWorkflow}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          Save Workflow
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default AgentWorkflowBuilder;
