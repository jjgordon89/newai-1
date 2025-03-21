import React, { useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeTypes,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Search, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

// Custom node types
const DocumentNode = ({ data }: { data: any }) => {
  return (
    <div className="p-3 rounded-md bg-primary text-primary-foreground shadow-md min-w-[150px]">
      <div className="font-bold truncate">{data.label}</div>
      <div className="text-xs opacity-80 truncate">{data.type}</div>
    </div>
  );
};

const ConceptNode = ({ data }: { data: any }) => {
  return (
    <div className="p-3 rounded-md bg-secondary text-secondary-foreground shadow-md min-w-[120px]">
      <div className="font-bold truncate">{data.label}</div>
    </div>
  );
};

const EntityNode = ({ data }: { data: any }) => {
  return (
    <div className="p-3 rounded-md bg-accent text-accent-foreground shadow-md min-w-[100px]">
      <div className="font-bold truncate">{data.label}</div>
      <div className="text-xs opacity-80 truncate">{data.category}</div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  document: DocumentNode,
  concept: ConceptNode,
  entity: EntityNode,
};

interface KnowledgeGraphVisualizationProps {
  workspaceId: string;
  documents?: any[];
  onNodeClick?: (node: Node) => void;
  className?: string;
}

const KnowledgeGraphVisualization: React.FC<
  KnowledgeGraphVisualizationProps
> = ({ workspaceId, documents = [], onNodeClick, className = "" }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [graphDensity, setGraphDensity] = useState(50);
  const [showEntities, setShowEntities] = useState(true);
  const [activeTab, setActiveTab] = useState("graph");
  const flowRef = useRef<HTMLDivElement>(null);

  // Generate sample knowledge graph data
  const generateSampleGraph = () => {
    const sampleNodes: Node[] = [];
    const sampleEdges: Edge[] = [];

    // Add document nodes
    documents.forEach((doc, index) => {
      sampleNodes.push({
        id: `doc-${doc.id || index}`,
        type: "document",
        data: {
          label: doc.title || `Document ${index + 1}`,
          type: doc.type || "pdf",
        },
        position: { x: 100 + (index % 3) * 300, y: 100 },
      });
    });

    // Add concept nodes
    const concepts = [
      "Machine Learning",
      "Natural Language Processing",
      "Vector Databases",
      "Embeddings",
      "Knowledge Graphs",
    ];
    concepts.forEach((concept, index) => {
      sampleNodes.push({
        id: `concept-${index}`,
        type: "concept",
        data: { label: concept },
        position: { x: 250 + (index % 3) * 300, y: 300 },
      });
    });

    // Add entity nodes if enabled
    if (showEntities) {
      const entities = [
        { name: "OpenAI", category: "Organization" },
        { name: "LanceDB", category: "Technology" },
        { name: "Python", category: "Language" },
        { name: "React", category: "Framework" },
        { name: "TypeScript", category: "Language" },
      ];

      entities.forEach((entity, index) => {
        sampleNodes.push({
          id: `entity-${index}`,
          type: "entity",
          data: { label: entity.name, category: entity.category },
          position: { x: 150 + (index % 3) * 300, y: 500 },
        });
      });
    }

    // Create edges based on graph density
    const maxEdges = (sampleNodes.length * (sampleNodes.length - 1)) / 2;
    const targetEdgeCount = Math.floor((graphDensity / 100) * maxEdges);

    let edgeCount = 0;
    while (edgeCount < targetEdgeCount) {
      const sourceIndex = Math.floor(Math.random() * sampleNodes.length);
      const targetIndex = Math.floor(Math.random() * sampleNodes.length);

      if (sourceIndex !== targetIndex) {
        const sourceId = sampleNodes[sourceIndex].id;
        const targetId = sampleNodes[targetIndex].id;
        const edgeId = `${sourceId}-${targetId}`;

        // Check if this edge already exists
        if (!sampleEdges.some((e) => e.id === edgeId)) {
          sampleEdges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            markerEnd: {
              type: MarkerType.Arrow,
            },
            style: { stroke: "#888" },
          });
          edgeCount++;
        }
      }
    }

    setNodes(sampleNodes);
    setEdges(sampleEdges);
  };

  // Filter nodes based on search term
  const filterGraph = () => {
    if (!searchTerm) {
      generateSampleGraph();
      return;
    }

    const filteredNodes = nodes.filter((node) =>
      node.data.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    const filteredEdges = edges.filter(
      (edge) =>
        filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
    );

    setNodes(filteredNodes);
    setEdges(filteredEdges);
  };

  // Load graph data on component mount
  useEffect(() => {
    setLoading(true);
    // In a real implementation, you would fetch actual knowledge graph data from your backend
    // For now, we'll generate sample data
    generateSampleGraph();
    setLoading(false);
  }, [workspaceId, documents.length, graphDensity, showEntities]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  return (
    <Card className={`w-full h-[600px] ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>Knowledge Graph</CardTitle>
        <CardDescription>
          Visualize relationships between documents, concepts, and entities
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2 flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="graph">Graph</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 w-[200px]"
                />
              </div>
              <Button size="sm" variant="outline" onClick={filterGraph}>
                Filter
              </Button>
              <Button size="sm" variant="outline" onClick={generateSampleGraph}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          <TabsContent value="graph" className="m-0">
            <div className="w-full h-[500px]" ref={flowRef}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={handleNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="density">Graph Density</Label>
                <span className="text-sm text-muted-foreground">
                  {graphDensity}%
                </span>
              </div>
              <Slider
                id="density"
                min={10}
                max={90}
                step={10}
                value={[graphDensity]}
                onValueChange={(value) => setGraphDensity(value[0])}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-entities"
                checked={showEntities}
                onCheckedChange={setShowEntities}
              />
              <Label htmlFor="show-entities">Show Entity Nodes</Label>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default KnowledgeGraphVisualization;
