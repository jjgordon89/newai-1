import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  MarkerType,
  useReactFlow,
  useKeyPress,
  OnSelectionChangeParams,
  NodeDragHandler,
  NodeMouseHandler,
  EdgeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { Panel } from "reactflow";
import {
  Trash2,
  Save,
  PlayCircle,
  Download,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Copy,
  Scissors,
  FileDown,
  FilePlus,
  Maximize,
  PlusCircle,
  Focus,
  Info,
  AlignJustify,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

// Node types imports
import { TriggerNode } from "./nodes/TriggerNode";
import { LLMNode } from "./nodes/LLMNode";
import { RAGNode } from "./nodes/RAGNode";
import { WebSearchNode } from "./nodes/WebSearchNode";
import { ConditionalNode } from "./nodes/ConditionalNode";
import { InputOutputNode } from "./nodes/InputOutputNode";
import { FunctionNode } from "./nodes/FunctionNode";
import { LanceDbNode } from "./nodes/LanceDbNode";

// Custom edge types (if we add them)
const customEdgeStyle = {
  stroke: "#b1b1b7",
  strokeWidth: 2,
  transitionProperty: "stroke, stroke-width",
  transitionDuration: "0.3s",
  transitionTimingFunction: "ease",
};

const activeEdgeStyle = {
  ...customEdgeStyle,
  stroke: "#4f46e5",
  strokeWidth: 3,
};

const nodeTypes = {
  trigger: TriggerNode,
  llm: LLMNode,
  rag: RAGNode,
  "web-search": WebSearchNode,
  conditional: ConditionalNode,
  input: InputOutputNode,
  output: InputOutputNode,
  function: FunctionNode,
  lancedb: LanceDbNode,
};

// Edge types
const edgeTypes = {};

// Custom default edge options
const defaultEdgeOptions = {
  style: customEdgeStyle,
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
  type: "smoothstep",
};

// History tracking for undo/redo
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

// Graph stats
interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  triggersCount: number;
  actionsCount: number;
}

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onNodeSelect?: (node: Node | null) => void;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onPlay?: () => void;
  readOnly?: boolean;
  showControls?: boolean;
  showMiniMap?: boolean;
  title?: string;
  workflowId?: string;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onSave,
  onPlay,
  readOnly = false,
  showControls = true,
  showMiniMap = true,
  title,
  workflowId,
  onToggleSidebar,
  showSidebarToggle = false,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [selectedElements, setSelectedElements] =
    useState<OnSelectionChangeParams>({ nodes: [], edges: [] });

  // Undo/Redo state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryUpdate, setIsHistoryUpdate] = useState(false);

  // UI state
  const [showGrid, setShowGrid] = useState(true);
  const [canvasMode, setCanvasMode] = useState<
    "default" | "connect" | "select"
  >("default");
  const [stats, setStats] = useState<GraphStats>({
    nodeCount: initialNodes.length,
    edgeCount: initialEdges.length,
    triggersCount: initialNodes.filter((n) => n.type === "trigger").length,
    actionsCount: initialNodes.filter(
      (n) => n.type !== "trigger" && n.type !== "input" && n.type !== "output",
    ).length,
  });

  // Add keyboard shortcuts support
  const deletePressed = useKeyPress(["Delete", "Backspace"]);
  const ctrlZPressed = useKeyPress(["z"]);
  const ctrlYPressed = useKeyPress(["y"]);
  const ctrlCPressed = useKeyPress(["c"]);
  const ctrlVPressed = useKeyPress(["v"]);
  const escPressed = useKeyPress(["Escape"]);

  // Get ReactFlow utility functions
  const { fitView, zoomIn, zoomOut, getViewport, setViewport } = useReactFlow();

  // Update stats when nodes or edges change
  useEffect(() => {
    setStats({
      nodeCount: nodes.length,
      edgeCount: edges.length,
      triggersCount: nodes.filter((n) => n.type === "trigger").length,
      actionsCount: nodes.filter(
        (n) =>
          n.type !== "trigger" && n.type !== "input" && n.type !== "output",
      ).length,
    });
  }, [nodes, edges]);

  // Add to history when nodes or edges change (except during undo/redo operations)
  useEffect(() => {
    if (isHistoryUpdate) {
      setIsHistoryUpdate(false);
      return;
    }

    // Only add to history if we have nodes or edges
    if (nodes.length > 0 || edges.length > 0) {
      // Add current state to history
      const newState: HistoryState = {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
      };

      // If we're not at the end of history, truncate it
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [nodes, edges]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setIsHistoryUpdate(true);
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setIsHistoryUpdate(true);
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Watch for keyboard shortcuts
  useEffect(() => {
    if (!readOnly) {
      // Delete selected elements
      if (
        deletePressed &&
        (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0)
      ) {
        if (selectedElements.nodes.length > 0) {
          setNodes((nds) =>
            nds.filter(
              (n) => !selectedElements.nodes.some((sn) => sn.id === n.id),
            ),
          );
        }
        if (selectedElements.edges.length > 0) {
          setEdges((eds) =>
            eds.filter(
              (e) => !selectedElements.edges.some((se) => se.id === e.id),
            ),
          );
        }
      }

      // Undo/Redo with proper event typing
      if (ctrlZPressed) {
        const evt = window.event as KeyboardEvent | undefined;
        if (
          evt &&
          (window.navigator.platform.match(/Mac/i) ? evt.metaKey : evt.ctrlKey)
        ) {
          handleUndo();
        }
      }
      if (ctrlYPressed) {
        const evt = window.event as KeyboardEvent | undefined;
        if (
          evt &&
          (window.navigator.platform.match(/Mac/i) ? evt.metaKey : evt.ctrlKey)
        ) {
          handleRedo();
        }
      }

      // Exit connect mode on escape
      if (escPressed && canvasMode !== "default") {
        setCanvasMode("default");
      }
    }
  }, [
    deletePressed,
    ctrlZPressed,
    ctrlYPressed,
    escPressed,
    selectedElements,
    canvasMode,
    readOnly,
    handleUndo,
    handleRedo,
  ]);

  // Node selection handler
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();
      setSelectedNode(node);
      setSelectedEdge(null);
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect],
  );

  // Edge selection handler
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setSelectedEdge(edge);
      setSelectedNode(null);
      if (onNodeSelect) {
        onNodeSelect(null);
      }
    },
    [onNodeSelect],
  );

  // Background click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  // Track multi-selection
  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelectedElements(params);

      // If only one node is selected, update selectedNode
      if (params.nodes.length === 1 && params.edges.length === 0) {
        setSelectedNode(params.nodes[0]);
        if (onNodeSelect) {
          onNodeSelect(params.nodes[0]);
        }
      } else if (params.nodes.length === 0 && params.edges.length === 1) {
        // If only one edge is selected, update selectedEdge
        setSelectedEdge(params.edges[0]);
        if (onNodeSelect) {
          onNodeSelect(null);
        }
      } else {
        // If multiple elements or nothing is selected
        setSelectedNode(null);
        setSelectedEdge(null);
        if (onNodeSelect) {
          onNodeSelect(null);
        }
      }
    },
    [onNodeSelect],
  );

  // Handle node drag
  const onNodeDragStart: NodeDragHandler = useCallback(() => {
    // Add drag start logic if needed
  }, []);

  const onNodeDrag: NodeDragHandler = useCallback(() => {
    // Add drag logic if needed
  }, []);

  const onNodeDragStop: NodeDragHandler = useCallback(() => {
    // Add drag stop logic if needed
  }, []);

  // Save the workflow
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  // Execute the workflow
  const handlePlay = useCallback(() => {
    if (onPlay) {
      onPlay();
    }
  }, [onPlay]);

  // Fit view to show all nodes
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2 });
  }, [fitView]);

  // Toggle grid visibility
  const handleToggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev);
  }, []);

  // Export workflow as JSON
  const handleExport = useCallback(() => {
    const workflow = {
      nodes,
      edges,
    };

    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `workflow-${workflowId || "export"}-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges, workflowId]);

  // Import workflow from JSON
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const workflow = JSON.parse(content);

            if (workflow.nodes && workflow.edges) {
              setNodes(workflow.nodes);
              setEdges(workflow.edges);
            }
          } catch (error) {
            console.error("Error importing workflow:", error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange || handleNodesChange}
        onEdgesChange={onEdgesChange || handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onInit={setReactFlowInstance}
        fitView
        snapToGrid={true}
        snapGrid={[15, 15]}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        {showGrid && <Background gap={15} size={1} color="#f1f1f1" />}

        {showControls && (
          <Panel position="top-right" className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Save Workflow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={handlePlay}
                    disabled={readOnly}
                  >
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Run Workflow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-8" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0 || readOnly}
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1 || readOnly}
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-8" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={zoomIn}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Zoom In</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={zoomOut}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Zoom Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={handleFitView}
                  >
                    <Focus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Fit View</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-8" />

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white"
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Export/Import</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Workflow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImport} disabled={readOnly}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  Import Workflow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {showSidebarToggle && (
              <>
                <Separator orientation="vertical" className="h-8" />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white"
                        onClick={onToggleSidebar}
                      >
                        <PanelLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Toggle Sidebar
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </Panel>
        )}

        {showMiniMap && (
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            nodeBorderRadius={2}
            nodeColor={(node) => {
              switch (node.type) {
                case "trigger":
                  return "#fb923c";
                case "llm":
                  return "#a855f7";
                case "rag":
                  return "#10b981";
                case "web-search":
                  return "#3b82f6";
                case "conditional":
                  return "#f59e0b";
                case "function":
                  return "#6366f1";
                case "input":
                case "output":
                  return "#ec4899";
                default:
                  return "#94a3b8";
              }
            }}
          />
        )}

        {/* Stats display */}
        <Panel
          position="bottom-left"
          className="bg-white/80 p-2 rounded-md text-xs border shadow-sm"
        >
          <div className="flex gap-3">
            <div>
              <span className="text-muted-foreground">Nodes:</span>{" "}
              {stats.nodeCount}
            </div>
            <div>
              <span className="text-muted-foreground">Edges:</span>{" "}
              {stats.edgeCount}
            </div>
            <div>
              <span className="text-muted-foreground">Triggers:</span>{" "}
              {stats.triggersCount}
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrap with ReactFlowProvider for use outside of a ReactFlow component
export const WorkflowCanvasWithProvider: React.FC<WorkflowCanvasProps> = (
  props,
) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvasWithProvider;
