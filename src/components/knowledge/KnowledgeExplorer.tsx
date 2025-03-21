import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, ChevronDown, ChevronRight, Download, Eye, FileText, Filter, Graph, Grid, Info, List, Maximize2, Minimize2, Plus, RefreshCw, Save, Search, Settings, Share, Zap } from "lucide-react";

// Mock data for knowledge graph
interface Node {
  id: string;
  label: string;
  type: 'document' | 'concept' | 'entity' | 'topic';
  size?: number;
  color?: string;
  metadata?: Record<string, any>;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight?: number;
  type?: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface Topic {
  id: string;
  name: string;
  keywords: string[];
  documentCount: number;
  score: number;
}

const mockGraphData: GraphData = {
  nodes: [
    { id: 'doc-1', label: 'Product Requirements Document', type: 'document', size: 30, color: '#4f46e5' },
    { id: 'doc-2', label: 'Technical Specification', type: 'document', size: 25, color: '#4f46e5' },
    { id: 'doc-3', label: 'Market Research Report', type: 'document', size: 28, color: '#4f46e5' },
    { id: 'doc-4', label: 'User Interview Transcripts', type: 'document', size: 22, color: '#4f46e5' },
    { id: 'doc-5', label: 'Competitive Analysis', type: 'document', size: 24, color: '#4f46e5' },
    
    { id: 'concept-1', label: 'Document Management', type: 'concept', size: 35, color: '#0ea5e9' },
    { id: 'concept-2', label: 'Search Functionality', type: 'concept', size: 32, color: '#0ea5e9' },
    { id: 'concept-3', label: 'Knowledge Base API', type: 'concept', size: 38, color: '#0ea5e9' },
    { id: 'concept-4', label: 'Workflow Integration', type: 'concept', size: 30, color: '#0ea5e9' },
    { id: 'concept-5', label: 'UI/UX Enhancements', type: 'concept', size: 33, color: '#0ea5e9' },
    
    { id: 'entity-1', label: 'Jane Smith', type: 'entity', size: 20, color: '#10b981' },
    { id: 'entity-2', label: 'John Doe', type: 'entity', size: 20, color: '#10b981' },
    { id: 'entity-3', label: 'Emily Johnson', type: 'entity', size: 20, color: '#10b981' },
    
    { id: 'topic-1', label: 'Document Organization', type: 'topic', size: 28, color: '#f59e0b' },
    { id: 'topic-2', label: 'Collaboration Features', type: 'topic', size: 26, color: '#f59e0b' },
    { id: 'topic-3', label: 'Search Capabilities', type: 'topic', size: 30, color: '#f59e0b' },
    { id: 'topic-4', label: 'API Integration', type: 'topic', size: 25, color: '#f59e0b' },
    { id: 'topic-5', label: 'User Experience', type: 'topic', size: 27, color: '#f59e0b' },
  ],
  edges: [
    { id: 'e1', source: 'doc-1', target: 'concept-1', weight: 0.8 },
    { id: 'e2', source: 'doc-1', target: 'concept-3', weight: 0.6 },
    { id: 'e3', source: 'doc-1', target: 'concept-4', weight: 0.7 },
    { id: 'e4', source: 'doc-1', target: 'entity-1', weight: 1.0 },
    { id: 'e5', source: 'doc-1', target: 'topic-1', weight: 0.9 },
    { id: 'e6', source: 'doc-1', target: 'topic-2', weight: 0.7 },
    
    { id: 'e7', source: 'doc-2', target: 'concept-2', weight: 0.9 },
    { id: 'e8', source: 'doc-2', target: 'concept-3', weight: 0.8 },
    { id: 'e9', source: 'doc-2', target: 'entity-2', weight: 1.0 },
    { id: 'e10', source: 'doc-2', target: 'topic-3', weight: 0.8 },
    { id: 'e11', source: 'doc-2', target: 'topic-4', weight: 0.9 },
    
    { id: 'e12', source: 'doc-3', target: 'concept-1', weight: 0.5 },
    { id: 'e13', source: 'doc-3', target: 'concept-5', weight: 0.6 },
    { id: 'e14', source: 'doc-3', target: 'entity-3', weight: 1.0 },
    { id: 'e15', source: 'doc-3', target: 'topic-5', weight: 0.7 },
    
    { id: 'e16', source: 'doc-4', target: 'concept-5', weight: 0.8 },
    { id: 'e17', source: 'doc-4', target: 'entity-3', weight: 0.9 },
    { id: 'e18', source: 'doc-4', target: 'topic-2', weight: 0.7 },
    { id: 'e19', source: 'doc-4', target: 'topic-5', weight: 0.9 },
    
    { id: 'e20', source: 'doc-5', target: 'concept-2', weight: 0.6 },
    { id: 'e21', source: 'doc-5', target: 'concept-4', weight: 0.7 },
    { id: 'e22', source: 'doc-5', target: 'entity-1', weight: 0.8 },
    { id: 'e23', source: 'doc-5', target: 'topic-3', weight: 0.6 },
    { id: 'e24', source: 'doc-5', target: 'topic-4', weight: 0.7 },
    
    { id: 'e25', source: 'concept-1', target: 'topic-1', weight: 0.9 },
    { id: 'e26', source: 'concept-2', target: 'topic-3', weight: 0.9 },
    { id: 'e27', source: 'concept-3', target: 'topic-4', weight: 0.8 },
    { id: 'e28', source: 'concept-4', target: 'topic-4', weight: 0.7 },
    { id: 'e29', source: 'concept-5', target: 'topic-5', weight: 0.9 },
    { id: 'e30', source: 'concept-5', target: 'topic-2', weight: 0.8 },
  ]
};

const mockTopics: Topic[] = [
  { id: 'topic-1', name: 'Document Organization', keywords: ['folder', 'tag', 'structure', 'organization', 'hierarchy'], documentCount: 12, score: 0.85 },
  { id: 'topic-2', name: 'Collaboration Features', keywords: ['share', 'comment', 'annotation', 'collaborate', 'team'], documentCount: 8, score: 0.78 },
  { id: 'topic-3', name: 'Search Capabilities', keywords: ['search', 'query', 'filter', 'find', 'retrieve'], documentCount: 15, score: 0.92 },
  { id: 'topic-4', name: 'API Integration', keywords: ['api', 'endpoint', 'integration', 'service', 'interface'], documentCount: 10, score: 0.81 },
  { id: 'topic-5', name: 'User Experience', keywords: ['ui', 'ux', 'interface', 'design', 'usability'], documentCount: 9, score: 0.76 },
  { id: 'topic-6', name: 'Performance Optimization', keywords: ['performance', 'speed', 'optimization', 'efficiency', 'latency'], documentCount: 7, score: 0.72 },
  { id: 'topic-7', name: 'Security Features', keywords: ['security', 'authentication', 'authorization', 'encryption', 'protection'], documentCount: 6, score: 0.68 },
  { id: 'topic-8', name: 'Data Analytics', keywords: ['analytics', 'metrics', 'dashboard', 'reporting', 'insights'], documentCount: 11, score: 0.83 },
];

export default function KnowledgeExplorer() {
  const [activeTab, setActiveTab] = useState('graph');
  const [graphData, setGraphData] = useState<GraphData>(mockGraphData);
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [graphLayout, setGraphLayout] = useState('force');
  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [nodeFilters, setNodeFilters] = useState<string[]>(['document', 'concept', 'entity', 'topic']);
  const [minEdgeWeight, setMinEdgeWeight] = useState(0.5);
  const [graphZoom, setGraphZoom] = useState(1);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Filter graph data based on search and filters
  const filteredGraphData = {
    nodes: graphData.nodes.filter(node => {
      // Filter by search query
      if (searchQuery && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by node type
      if (!nodeFilters.includes(node.type)) {
        return false;
      }
      
      return true;
    }),
    edges: graphData.edges.filter(edge => {
      // Filter by edge weight
      if ((edge.weight || 0) < minEdgeWeight) {
        return false;
      }
      
      // Only include edges where both source and target nodes are in the filtered nodes
      const filteredNodeIds = new Set(graphData.nodes
        .filter(node => nodeFilters.includes(node.type) && 
          (!searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase())))
        .map(node => node.id));
      
      return filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target);
    })
  };
  
  // Filter topics based on search
  const filteredTopics = topics.filter(topic => 
    !searchQuery || 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Toggle node type filter
  const toggleNodeFilter = (type: string) => {
    setNodeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Handle node selection
  const handleNodeSelect = (node: Node) => {
    setSelectedNode(node === selectedNode ? null : node);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setNodeFilters(['document', 'concept', 'entity', 'topic']);
    setMinEdgeWeight(0.5);
    setSelectedNode(null);
  };
  
  // Render the knowledge graph
  const renderKnowledgeGraph = () => {
    // In a real implementation, this would use a graph visualization library like Sigma.js, vis.js, or react-force-graph
    // For this example, we'll render a simplified representation
    
    return (
      <div className="relative h-full w-full bg-muted/20 overflow-hidden" ref={canvasRef}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Graph className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Knowledge Graph Visualization</p>
            <p className="max-w-md mx-auto mt-2">
              This is a placeholder for the interactive knowledge graph visualization.
              In a real implementation, this would use a graph visualization library to render
              the nodes and edges with interactive features.
            </p>
            <div className="mt-4">
              <p><strong>Nodes:</strong> {filteredGraphData.nodes.length}</p>
              <p><strong>Edges:</strong> {filteredGraphData.edges.length}</p>
              <p><strong>Layout:</strong> {graphLayout}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the topic modeling visualization
  const renderTopicModeling = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filteredTopics.map(topic => (
          <Card key={topic.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                {topic.name}
                <Badge variant="outline" className="ml-2">
                  {topic.documentCount} docs
                </Badge>
              </CardTitle>
              <CardDescription>
                Topic Score: {(topic