import React, { useState, useCallback, useEffect } from "react";
import {
  ZapIcon,
  BrainIcon,
  SearchIcon,
  DatabaseIcon,
  SplitIcon,
  ArrowRightFromLineIcon,
  ArrowLeftToLineIcon,
  FunctionSquareIcon,
  ServerIcon,
  GlobeIcon,
  MessageSquareIcon,
  ClockIcon,
  FileTextIcon,
  BookOpenIcon,
  PuzzleIcon,
  RefreshCwIcon,
  Bot,
  CircleSlashedIcon,
  BarChartIcon,
  ArrowBigDownIcon,
  CodeIcon,
  FilterIcon,
  TagIcon,
  BellIcon,
  ChevronRightIcon,
  Info,
  Sparkles,
  Star,
  Blocks,
  LayoutGrid,
  Book,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface NodeTypeItem {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  subcategory?: string;
  tags?: string[];
  isNew?: boolean;
  isExperimental?: boolean;
  color?: string;
  popularity?: number; // 1-10 scale for popularity/frequency of use
}

const nodeTypes: NodeTypeItem[] = [
  // Flow Control Nodes
  {
    type: "trigger",
    name: "Trigger",
    description: "Starting point for the workflow",
    icon: <ZapIcon className="h-4 w-4 text-orange-500" />,
    category: "flow",
    subcategory: "control",
    color: "bg-orange-50",
    tags: ["start", "event", "webhook"],
    popularity: 10,
  },
  {
    type: "conditional",
    name: "Conditional",
    description: "Branch based on conditions",
    icon: <SplitIcon className="h-4 w-4 text-amber-500" />,
    category: "flow",
    subcategory: "control",
    color: "bg-amber-50",
    tags: ["if", "branch", "decision"],
    popularity: 7,
  },
  {
    type: "input",
    name: "Input",
    description: "Define input variable",
    icon: <ArrowRightFromLineIcon className="h-4 w-4 text-cyan-500" />,
    category: "flow",
    subcategory: "data",
    color: "bg-cyan-50",
    tags: ["variable", "parameter"],
    popularity: 8,
  },
  {
    type: "output",
    name: "Output",
    description: "Define output variable",
    icon: <ArrowLeftToLineIcon className="h-4 w-4 text-pink-500" />,
    category: "flow",
    subcategory: "data",
    color: "bg-pink-50",
    tags: ["variable", "result", "return"],
    popularity: 8,
  },
  {
    type: "function",
    name: "Function",
    description: "Execute custom code",
    icon: <FunctionSquareIcon className="h-4 w-4 text-indigo-500" />,
    category: "programming",
    subcategory: "code",
    color: "bg-indigo-50",
    tags: ["javascript", "python", "code"],
    popularity: 6,
  },
  {
    type: "cron",
    name: "Schedule",
    description: "Run on a specified schedule",
    icon: <ClockIcon className="h-4 w-4 text-blue-500" />,
    category: "flow",
    subcategory: "control",
    color: "bg-blue-50",
    tags: ["time", "cron", "timing"],
    isNew: true,
    popularity: 4,
  },
  {
    type: "loop",
    name: "Loop",
    description: "Iterate over data collection",
    icon: <RefreshCwIcon className="h-4 w-4 text-violet-500" />,
    category: "flow",
    subcategory: "control",
    color: "bg-violet-50",
    tags: ["for", "each", "iteration"],
    isNew: true,
    popularity: 5,
  },

  // AI Nodes
  {
    type: "llm",
    name: "LLM",
    description: "Process text with a language model",
    icon: <BrainIcon className="h-4 w-4 text-purple-500" />,
    category: "ai",
    subcategory: "processing",
    color: "bg-purple-50",
    tags: ["gpt", "claude", "language"],
    popularity: 9,
  },
  {
    type: "rag",
    name: "RAG",
    description: "Retrieval augmented generation",
    icon: <DatabaseIcon className="h-4 w-4 text-emerald-500" />,
    category: "ai",
    subcategory: "knowledge",
    color: "bg-emerald-50",
    tags: ["retrieve", "document", "context"],
    popularity: 9,
  },
  {
    type: "agent",
    name: "AI Agent",
    description: "Autonomous reasoning agent",
    icon: <Bot className="h-4 w-4 text-violet-500" />,
    category: "ai",
    subcategory: "autonomous",
    color: "bg-violet-50",
    tags: ["react", "reasoning", "chain"],
    isExperimental: true,
    popularity: 7,
  },
  {
    type: "text-to-embedding",
    name: "Text Embeddings",
    description: "Convert text to vector embeddings",
    icon: <ArrowBigDownIcon className="h-4 w-4 text-fuchsia-500" />,
    category: "ai",
    subcategory: "processing",
    color: "bg-fuchsia-50",
    tags: ["vector", "similarity", "encode"],
    isNew: true,
    popularity: 6,
  },

  // Data Nodes
  {
    type: "knowledge-base",
    name: "Knowledge Base",
    description: "Query your knowledge base",
    icon: <Book className="h-4 w-4 text-emerald-500" />,
    category: "data",
    subcategory: "retrieval",
    color: "bg-emerald-50",
    tags: ["documents", "rag", "retrieval"],
    isNew: true,
    popularity: 8,
  },
  {
    type: "web-search",
    name: "Web Search",
    description: "Search the web for information",
    icon: <GlobeIcon className="h-4 w-4 text-blue-500" />,
    category: "data",
    subcategory: "retrieval",
    color: "bg-blue-50",
    tags: ["google", "bing", "internet"],
    popularity: 8,
  },
  {
    type: "lancedb",
    name: "Vector Search",
    description: "LanceDB powered semantic search",
    icon: <ServerIcon className="h-4 w-4 text-blue-500" />,
    category: "data",
    subcategory: "database",
    color: "bg-blue-50",
    tags: ["vector", "semantic", "database"],
    popularity: 7,
  },
  {
    type: "data-transform",
    name: "Data Transform",
    description: "Transform data between formats",
    icon: <CodeIcon className="h-4 w-4 text-green-500" />,
    category: "data",
    subcategory: "processing",
    color: "bg-green-50",
    tags: ["json", "csv", "convert"],
    isNew: true,
    popularity: 5,
  },
  {
    type: "filter",
    name: "Filter",
    description: "Filter arrays or collections",
    icon: <FilterIcon className="h-4 w-4 text-amber-500" />,
    category: "data",
    subcategory: "processing",
    color: "bg-amber-50",
    tags: ["query", "select", "where"],
    isNew: true,
    popularity: 5,
  },

  // Integration Nodes
  {
    type: "api-call",
    name: "API Call",
    description: "Call external APIs",
    icon: <ArrowRightFromLineIcon className="h-4 w-4 text-teal-500" />,
    category: "integrations",
    subcategory: "web",
    color: "bg-teal-50",
    tags: ["http", "rest", "fetch"],
    isNew: true,
    popularity: 6,
  },
  {
    type: "notification",
    name: "Notification",
    description: "Send notifications",
    icon: <BellIcon className="h-4 w-4 text-red-500" />,
    category: "integrations",
    subcategory: "messaging",
    color: "bg-red-50",
    tags: ["email", "slack", "alert"],
    isNew: true,
    popularity: 4,
  },
  {
    type: "document-loader",
    name: "Document Loader",
    description: "Load documents from sources",
    icon: <FileTextIcon className="h-4 w-4 text-amber-500" />,
    category: "integrations",
    subcategory: "storage",
    color: "bg-amber-50",
    tags: ["pdf", "docx", "file"],
    isNew: true,
    popularity: 6,
  },

  // Visualization Nodes
  {
    type: "chart",
    name: "Chart",
    description: "Create data visualizations",
    icon: <BarChartIcon className="h-4 w-4 text-blue-500" />,
    category: "visualization",
    subcategory: "charts",
    color: "bg-blue-50",
    tags: ["graph", "plot", "visualize"],
    isExperimental: true,
    popularity: 3,
  },
];

// Group node types by subcategory
interface GroupedNodes {
  [key: string]: {
    name: string;
    nodes: NodeTypeItem[];
  };
}

const groupNodesBySubcategory = (
  nodes: NodeTypeItem[],
  category: string,
): GroupedNodes => {
  return nodes
    .filter((node) => node.category === category)
    .reduce((acc, node) => {
      const subcategory = node.subcategory || "other";
      if (!acc[subcategory]) {
        acc[subcategory] = {
          name: subcategoryDisplayNames[subcategory] || subcategory,
          nodes: [],
        };
      }
      acc[subcategory].nodes.push(node);
      return acc;
    }, {} as GroupedNodes);
};

// Display names for subcategories
const subcategoryDisplayNames: Record<string, string> = {
  control: "Control Flow",
  data: "Data Flow",
  code: "Code Execution",
  processing: "Processing",
  knowledge: "Knowledge & Memory",
  autonomous: "Autonomous Agents",
  retrieval: "Data Retrieval",
  database: "Database Operations",
  web: "Web & APIs",
  messaging: "Messaging",
  storage: "Storage & Documents",
  charts: "Charts & Visualizations",
  other: "Other",
};

export const NodePalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {
      flow: true,
      ai: true,
      data: true,
      programming: true,
      integrations: true,
      visualization: true,
    },
  );
  const [activeTab, setActiveTab] = useState("categories");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Track node usage frequency
  const [nodeUsage, setNodeUsage] = useState<Record<string, number>>({});

  // Initialize with some favorites and usage data from localStorage
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("workflow-favorite-nodes");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        // Default favorites if none exist
        const defaultFavorites = ["trigger", "llm", "rag", "web-search"];
        setFavorites(defaultFavorites);
        localStorage.setItem(
          "workflow-favorite-nodes",
          JSON.stringify(defaultFavorites),
        );
      }

      const storedUsage = localStorage.getItem("workflow-node-usage");
      if (storedUsage) {
        setNodeUsage(JSON.parse(storedUsage));
      }
    } catch (e) {
      console.error("Error loading node palette preferences:", e);
    }
  }, []);

  // Filter nodes based on search term
  const filteredNodes = searchTerm
    ? nodeTypes.filter(
        (node) =>
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    : nodeTypes;

  // Get most used/popular nodes for quick access
  const getPopularNodes = () => {
    // Combine predefined popularity with actual usage
    const nodesWithScore = nodeTypes.map((node) => {
      const usageCount = nodeUsage[node.type] || 0;
      const basePopularity = node.popularity || 5;
      const score = basePopularity + Math.min(usageCount * 0.5, 5); // Cap usage impact

      return {
        ...node,
        score,
      };
    });

    // Return top 5 by score
    return nodesWithScore.sort((a, b) => b.score - a.score).slice(0, 5);
  };

  // Get favorited nodes
  const getFavoriteNodes = () => {
    return nodeTypes.filter((node) => favorites.includes(node.type));
  };

  // Toggle favorite status
  const toggleFavorite = (nodeType: string) => {
    const newFavorites = favorites.includes(nodeType)
      ? favorites.filter((type) => type !== nodeType)
      : [...favorites, nodeType];

    setFavorites(newFavorites);
    localStorage.setItem(
      "workflow-favorite-nodes",
      JSON.stringify(newFavorites),
    );
  };

  // Create node drag handler
  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    nodeName: string,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("nodeName", nodeName);
    event.dataTransfer.effectAllowed = "move";

    // Track usage
    const newUsage = {
      ...nodeUsage,
      [nodeType]: (nodeUsage[nodeType] || 0) + 1,
    };
    setNodeUsage(newUsage);
    localStorage.setItem("workflow-node-usage", JSON.stringify(newUsage));
  };

  // Toggle category open state
  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Render a single node item
  const renderNodeItem = (node: NodeTypeItem) => {
    const isFavorite = favorites.includes(node.type);

    return (
      <div key={node.type}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center gap-3 p-3 border rounded-md cursor-grab relative
                hover:bg-accent/10 hover:border-accent transition-all shadow-sm hover:shadow-md
                ${node.color || "bg-background"}`}
              draggable
              onDragStart={(e) => onDragStart(e, node.type, node.name)}
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm border">
                {node.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium flex items-center">
                  {node.name}
                  {node.isNew && (
                    <Badge className="ml-2 py-0 h-4 text-[9px] bg-green-100 text-green-800">
                      New
                    </Badge>
                  )}
                  {node.isExperimental && (
                    <Badge className="ml-2 py-0 h-4 text-[9px] bg-amber-100 text-amber-800">
                      Experimental
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {node.description}
                </div>
              </div>

              <button
                className={`absolute top-1 right-1 rounded-full p-0.5 text-muted-foreground
                  hover:bg-background hover:text-primary ${isFavorite ? "text-amber-500" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleFavorite(node.type);
                }}
                title={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Star
                  className="h-3.5 w-3.5"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-medium">{node.name}</div>
              <p className="text-sm">{node.description}</p>
              {node.tags && node.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {node.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs px-1 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  };

  // Render a category of nodes
  const renderCategory = (
    categoryName: string,
    displayName: string,
    icon: React.ReactNode,
  ) => {
    const categoryNodes = filteredNodes.filter(
      (node) => node.category === categoryName,
    );
    if (categoryNodes.length === 0) return null;

    const groupedNodes = groupNodesBySubcategory(filteredNodes, categoryName);

    return (
      <Collapsible
        key={categoryName}
        open={openCategories[categoryName]}
        onOpenChange={() => toggleCategory(categoryName)}
        className="mb-2"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-accent/10 font-medium">
          <div className="flex items-center gap-2">
            {icon}
            <span>{displayName}</span>
            <Badge className="ml-2 bg-muted text-muted-foreground">
              {categoryNodes.length}
            </Badge>
          </div>
          <ChevronRightIcon
            className={`h-4 w-4 transition-transform ${openCategories[categoryName] ? "rotate-90" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 pr-1 pt-2 pb-1 space-y-3">
          {Object.entries(groupedNodes).map(([subcategory, group]) => (
            <div key={subcategory} className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-2">
                {group.name}
              </div>
              <div className="space-y-2">{group.nodes.map(renderNodeItem)}</div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Render tabs: Categories, All Nodes, Favorites
  const renderTabContent = () => {
    switch (activeTab) {
      case "categories":
        return (
          <div className="space-y-1">
            {renderCategory(
              "flow",
              "Flow Control",
              <SplitIcon className="h-4 w-4 text-amber-500" />,
            )}
            {renderCategory(
              "ai",
              "AI & ML",
              <BrainIcon className="h-4 w-4 text-purple-500" />,
            )}
            {renderCategory(
              "data",
              "Data Processing",
              <DatabaseIcon className="h-4 w-4 text-blue-500" />,
            )}
            {renderCategory(
              "programming",
              "Programming",
              <CodeIcon className="h-4 w-4 text-indigo-500" />,
            )}
            {renderCategory(
              "integrations",
              "Integrations",
              <ArrowRightFromLineIcon className="h-4 w-4 text-teal-500" />,
            )}
            {renderCategory(
              "visualization",
              "Visualization",
              <BarChartIcon className="h-4 w-4 text-blue-500" />,
            )}
          </div>
        );

      case "all":
        return (
          <div className="space-y-2">
            {filteredNodes.length > 0 ? (
              filteredNodes.map(renderNodeItem)
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No nodes match your search
                </p>
              </div>
            )}
          </div>
        );

      case "favorites":
        const favoriteNodes = getFavoriteNodes();
        return (
          <div className="space-y-2">
            {favoriteNodes.length > 0 ? (
              favoriteNodes.map(renderNodeItem)
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Star className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  You haven't added any favorites yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click the star on a node to add it to favorites
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50/40">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Blocks className="h-5 w-5 text-primary" />
          Node Palette
        </h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop nodes to create your workflow
        </p>

        <div className="mt-3 relative">
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={() => setSearchTerm("")}
            >
              <CircleSlashedIcon className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-3 mx-4 mt-3">
          <TabsTrigger value="categories">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="all">
            <Blocks className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 px-4 py-2">
          <TabsContent
            value={activeTab}
            className="mt-0 data-[state=active]:flex data-[state=active]:flex-col"
          >
            {renderTabContent()}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Quick access bar for frequently used nodes */}
      <div className="p-3 border-t bg-slate-50/60">
        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
          Popular Nodes
        </div>
        <div className="flex justify-between gap-1">
          {getPopularNodes().map((node) => (
            <TooltipProvider key={`quick-${node.type}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`p-2.5 rounded-md cursor-grab flex flex-col items-center shadow-sm border
                      ${node.color || "bg-background"} hover:border-primary/50 hover:shadow-md transition-all hover:-translate-y-1`}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type, node.name)}
                  >
                    <div className="mb-1">{node.icon}</div>
                    <span className="text-[10px] text-muted-foreground">
                      {node.name}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{node.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
};
