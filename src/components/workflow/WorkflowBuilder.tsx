import React, { useState, useCallback, useRef, useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflow } from "@/context/WorkflowContext";
import {
  WorkflowNode as WorkflowNodeType,
  NodeType,
  WorkflowEdge,
} from "@/lib/workflowTypes";
import { NodePalette } from "./NodePalette";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  Save,
  PlayCircle,
  LayoutGrid,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { WorkflowCanvasWithProvider } from "./WorkflowCanvas";

// Import node components
import { TriggerNode } from "./nodes/TriggerNode";
import { LLMNode } from "./nodes/LLMNode";
import { RAGNode } from "./nodes/RAGNode";
import { LanceDbNode } from "./nodes/LanceDbNode";
import { KnowledgeBaseNode } from "./nodes/KnowledgeBaseNode";
import { WebSearchNode } from "./nodes/WebSearchNode";
import { ConditionalNode } from "./nodes/ConditionalNode";
import { InputOutputNode } from "./nodes/InputOutputNode";
import { FunctionNode } from "./nodes/FunctionNode";
import { AgentNode } from "./nodes/AgentNode";

// Import types from reactflow that we need
import {
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeChange,
  EdgeChange,
  MarkerType,
} from "reactflow";

// Node type to component mapping
const nodeTypes = {
  trigger: TriggerNode,
  llm: LLMNode,
  rag: RAGNode,
  lancedb: LanceDbNode,
  "knowledge-base": KnowledgeBaseNode,
  "web-search": WebSearchNode,
  conditional: ConditionalNode,
  input: InputOutputNode,
  output: InputOutputNode,
  function: FunctionNode,
  agent: AgentNode,
};

interface WorkflowBuilderProps {
  workflowId?: string;
  onBack?: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflowId,
  onBack,
}) => {
  const {
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    addNode,
    updateNode,
    deleteNode,
    addEdge: addWorkflowEdge,
    deleteEdge: deleteWorkflowEdge,
  } = useWorkflow();

  // Workflow state
  const [workflow, setWorkflow] = useState(
    workflowId ? getWorkflow(workflowId) : null,
  );
  const [workflowName, setWorkflowName] = useState(
    workflow?.name || "New Workflow",
  );
  const [workflowDescription, setWorkflowDescription] = useState(
    workflow?.description || "",
  );
  const [isEditingName, setIsEditingName] = useState(!workflowId);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(!workflowId);

  // Execution state
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [showExecutionResults, setShowExecutionResults] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Initialize the workflow
  useEffect(() => {
    if (workflowId) {
      const existingWorkflow = getWorkflow(workflowId);
      if (existingWorkflow) {
        setWorkflow(existingWorkflow);
        setWorkflowName(existingWorkflow.name);
        setWorkflowDescription(existingWorkflow.description || "");

        // Convert workflow nodes to React Flow nodes
        const flowNodes = existingWorkflow.nodes.map(
          (node: WorkflowNodeType) => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: { ...node.data },
          }),
        );

        setNodes(flowNodes);
        setEdges(existingWorkflow.edges);
      }
    }
  }, [workflowId, getWorkflow]);

  // Save workflow changes
  const saveWorkflow = useCallback(() => {
    if (workflow) {
      // Update existing workflow
      updateWorkflow(workflow.id, {
        name: workflowName,
        description: workflowDescription,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type as NodeType,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || "default",
          label: edge.label ? String(edge.label) : undefined,
          animated: edge.animated,
        })) as WorkflowEdge[],
      });

      toast({
        title: "Workflow Saved",
        description: `"${workflowName}" has been updated successfully.`,
      });
    } else {
      // Create new workflow
      const newWorkflow = createWorkflow(workflowName, workflowDescription);
      setWorkflow(newWorkflow);

      // Add the nodes and edges to the new workflow
      nodes.forEach((node) => {
        addNode(newWorkflow.id, {
          type: node.type as NodeType,
          position: node.position,
          data: node.data,
        });
      });

      edges.forEach((edge) => {
        addWorkflowEdge(newWorkflow.id, {
          source: edge.source,
          target: edge.target,
          type: edge.type || "default",
          label: edge.label ? String(edge.label) : undefined,
        });
      });

      toast({
        title: "Workflow Created",
        description: `"${workflowName}" has been created successfully.`,
      });
    }
  }, [
    workflow,
    workflowName,
    workflowDescription,
    nodes,
    edges,
    updateWorkflow,
    createWorkflow,
    addNode,
    addWorkflowEdge,
  ]);

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Update selected node if it's being removed
      changes.forEach((change) => {
        if (
          change.type === "remove" &&
          selectedNode &&
          change.id === selectedNode.id
        ) {
          setSelectedNode(null);
        }
      });
    },
    [onNodesChange, selectedNode],
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange],
  );

  // Handle new connection (edge)
  const onConnect = useCallback(
    (connection: Connection) => {
      // Create edge with slight curve
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  // Handle node selection
  const onNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle background click to deselect nodes
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Handle node deletion
  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes]);

  // Handle node drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData("application/reactflow");
      const nodeName = event.dataTransfer.getData("nodeName");

      if (
        typeof nodeType === "undefined" ||
        !nodeType ||
        !reactFlowBounds ||
        !reactFlowInstance
      ) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: { label: nodeName || `New ${nodeType} Node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  // Handle node config updates
  const handleNodeUpdate = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      );

      // Update selected node if it's the one being edited
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode((prev) =>
          prev ? { ...prev, data: { ...prev.data, ...data } } : null,
        );
      }
    },
    [setNodes, selectedNode],
  );

  // Create a new workflow from template
  const createFromTemplate = useCallback(
    (templateId: string) => {
      const newWorkflow = createWorkflow(
        workflowName,
        workflowDescription,
        templateId,
      );
      setWorkflow(newWorkflow);

      // Load the template nodes and edges
      const template = getWorkflow(newWorkflow.id);
      if (template) {
        const flowNodes = template.nodes.map((node: WorkflowNodeType) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: { ...node.data },
        }));

        setNodes(flowNodes);
        setEdges(template.edges);
      }

      setShowTemplateDialog(false);
    },
    [
      workflowName,
      workflowDescription,
      createWorkflow,
      getWorkflow,
      setNodes,
      setEdges,
    ],
  );

  // Handle workflow execution
  const handleRunWorkflow = useCallback(() => {
    if (!workflow) {
      toast({
        title: "Error",
        description: "Please save the workflow before running it.",
        variant: "destructive",
      });
      return;
    }

    // Save the workflow first to make sure it's up to date
    saveWorkflow();

    // Set execution state to running
    setIsExecuting(true);
    setExecutionLogs([]);

    // Visualize the execution by showing a loading indicator on nodes
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isRunning: true,
          isCompleted: false,
          isError: false,
          errorMessage: null,
          output: null,
        },
      })),
    );

    toast({
      title: "Workflow Execution Started",
      description: "The workflow is now running...",
    });

    // Execute the workflow
    import("@/lib/workflowExecutionService").then(
      ({ workflowExecutionService }) => {
        workflowExecutionService.executeWorkflow(workflow, {
          onNodeStart: (nodeId) => {
            // Update node to show it's currently executing
            setNodes((prevNodes) =>
              prevNodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  isRunning: node.id === nodeId,
                  isCompleted: false,
                  isError: false,
                },
              })),
            );
          },
          onNodeComplete: (nodeId, output) => {
            // Update node to show it's completed
            setNodes((prevNodes) =>
              prevNodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  isRunning: false,
                  isCompleted: node.id === nodeId,
                  isError: false,
                  output: node.id === nodeId ? output : node.data.output,
                },
              })),
            );
          },
          onNodeError: (nodeId, error) => {
            // Update node to show there was an error
            setNodes((prevNodes) =>
              prevNodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  isRunning: false,
                  isCompleted: false,
                  isError: node.id === nodeId,
                  errorMessage:
                    node.id === nodeId ? error : node.data.errorMessage,
                },
              })),
            );
          },
          onLogUpdate: (log) => {
            setExecutionLogs((prev) => [...prev, log]);
          },
          onWorkflowComplete: (result) => {
            // Set execution state to completed
            setIsExecuting(false);

            // Store execution results
            setExecutionResults(result);

            // Show execution results
            setShowExecutionResults(true);

            if (result.success) {
              toast({
                title: "Workflow Completed",
                description: "The workflow has executed successfully.",
              });
            } else {
              toast({
                title: "Workflow Error",
                description: `Error: ${result.error || "Unknown error"}`,
                variant: "destructive",
                duration: 10000,
              });
            }
          },
        });
      },
    );
  }, [
    workflow,
    saveWorkflow,
    setNodes,
    toast,
    setExecutionResults,
    setExecutionLogs,
    setShowExecutionResults,
    setIsExecuting,
  ]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft />
          </Button>

          {isEditingName ? (
            <div className="flex gap-2">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-64"
                placeholder="Workflow name"
                autoFocus
              />
              <Button size="sm" onClick={() => setIsEditingName(false)}>
                Done
              </Button>
            </div>
          ) : (
            <div
              className="text-xl font-semibold cursor-pointer hover:underline"
              onClick={() => setIsEditingName(true)}
            >
              {workflowName || "Untitled Workflow"}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => setShowTemplateDialog(true)}
          >
            <LayoutGrid className="h-4 w-4" />
            Templates
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={saveWorkflow}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>

          <Button
            className="flex items-center gap-1"
            onClick={handleRunWorkflow}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Run Workflow
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        {/* Node palette */}
        <div className="w-64 border-r overflow-y-auto">
          <NodePalette />
        </div>

        {/* Flow editor */}
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <WorkflowCanvasWithProvider
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              onNodeSelect={onNodeClick}
              onSave={saveWorkflow}
              onPlay={handleRunWorkflow}
              readOnly={isExecuting}
              showControls={true}
              showMiniMap={true}
              title={workflowName}
              workflowId={workflow?.id}
              onToggleSidebar={() => {}} // Could implement a sidebar toggle if needed
              showSidebarToggle={false}
            />
          </ReactFlowProvider>
        </div>

        {/* Node configuration */}
        {selectedNode && (
          <div className="w-80 border-l overflow-y-auto">
            <NodeConfigPanel node={selectedNode} onUpdate={handleNodeUpdate} />
          </div>
        )}
      </div>

      {/* Template selection dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="templates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Use a Template</TabsTrigger>
              <TabsTrigger value="empty">Start from Scratch</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* OpenRouter AI Agent Template */}
                <Card className="cursor-pointer hover:border-primary transition-colors border-blue-200">
                  <CardHeader className="pb-2 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        OpenRouter AI Agent
                      </CardTitle>
                      <Badge variant="outline" className="bg-blue-100">
                        New
                      </Badge>
                    </div>
                    <CardDescription>
                      Powerful agent using OpenRouter models
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      An AI agent workflow leveraging OpenRouter's 100+ models
                      with RAG capabilities, web search, and more.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() =>
                        createFromTemplate("openrouter-agent-template")
                      }
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>

                {/* Simple RAG Agent Template */}
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Simple RAG Agent</CardTitle>
                    <CardDescription>
                      Basic workflow using retrieval augmented generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      A simple workflow that retrieves relevant documents and
                      uses them to generate a response.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => createFromTemplate("template-1")}
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Web Search Agent</CardTitle>
                    <CardDescription>
                      Enhances responses with web search results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      A workflow that uses web search to gather information
                      before generating a response.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => createFromTemplate("template-2")}
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="empty" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>New Workflow</CardTitle>
                  <CardDescription>
                    Create a workflow from scratch
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Workflow Name
                    </label>
                    <Input
                      id="name"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="My Custom Workflow"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      id="description"
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Describe what this workflow does"
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => setShowTemplateDialog(false)}
                  >
                    Create Empty Workflow
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Execution Results Dialog */}
      <Dialog
        open={showExecutionResults}
        onOpenChange={setShowExecutionResults}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Workflow Execution{" "}
              {executionResults?.success ? (
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-50 text-green-700 border-green-200"
                >
                  Successful
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="ml-2 bg-red-50 text-red-700 border-red-200"
                >
                  Failed
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="results">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4 mt-4">
              {executionResults?.success ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Output</h3>
                  {executionResults?.output &&
                  Object.keys(executionResults.output).length > 0 ? (
                    <div className="bg-slate-50 p-4 rounded-md overflow-auto max-h-80">
                      <pre className="text-sm">
                        {JSON.stringify(executionResults.output, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No output data available
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-red-700 mb-1">
                        Execution Failed
                      </h3>
                      <p className="text-red-600">
                        {executionResults?.error || "Unknown error occurred"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Execution Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-md">
                    <p className="text-sm font-medium">Nodes</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {nodes.filter((n) => n.data.isCompleted).length}{" "}
                          completed
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">
                          {nodes.filter((n) => n.data.isError).length} failed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-md">
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm mt-2">
                      {executionResults?.executionTime || "---"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <div className="bg-black text-green-400 font-mono p-4 rounded-md overflow-auto max-h-96">
                {executionLogs.length > 0 ? (
                  executionLogs.map((log, index) => (
                    <div key={index} className="text-xs mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No logs available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowExecutionResults(false)}
            >
              Close
            </Button>
            <Button onClick={handleRunWorkflow} disabled={isExecuting}>
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Run Again
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
