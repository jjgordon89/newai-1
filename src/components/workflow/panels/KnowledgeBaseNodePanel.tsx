import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Book,
  Search,
  Sliders,
  Sparkles,
  FileText,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Bot,
  Wand2,
  Filter,
  ChevronDown,
  X,
} from "lucide-react";

interface KnowledgeBaseNodePanelProps {
  data: any;
  onChange: (data: any) => void;
}

export const KnowledgeBaseNodePanel: React.FC<KnowledgeBaseNodePanelProps> = ({
  data,
  onChange,
}) => {
  const { activeWorkspaceId, workspaces, listDocuments } = useWorkspace();
  const documents =
    listDocuments(data.workspaceId || activeWorkspaceId || "") || [];

  const [activeTab, setActiveTab] = useState("basic");
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [filterKey, setFilterKey] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Get selected document ids
  const selectedDocIds = data.documents || [];

  // Handle document selection
  const handleDocumentToggle = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      onChange({
        ...data,
        documents: selectedDocIds.filter((id: string) => id !== docId),
      });
    } else {
      onChange({
        ...data,
        documents: [...selectedDocIds, docId],
      });
    }
  };

  // Handle filter addition
  const handleAddFilter = () => {
    if (!filterKey.trim()) return;

    const newFilters = { ...data.filterOptions } || {};
    newFilters[filterKey.trim()] = filterValue.trim();

    onChange({
      ...data,
      filterOptions: newFilters,
    });

    setFilterKey("");
    setFilterValue("");
    setShowFilterForm(false);
  };

  // Handle filter removal
  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...data.filterOptions };
    delete newFilters[key];

    onChange({
      ...data,
      filterOptions: newFilters,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="h-5 w-5 text-emerald-500" />
          <h3 className="text-base font-medium">Knowledge Base</h3>
        </div>
        <Badge className="bg-emerald-100 text-emerald-800">RAG</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="retrieval">Retrieval</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nodeTitle">Node Title</Label>
              <Input
                id="nodeTitle"
                value={data.title || "Knowledge Base"}
                onChange={(e) => onChange({ ...data, title: e.target.value })}
                placeholder="Enter a title for this node"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workspace">Workspace</Label>
              <Select
                value={data.workspaceId || activeWorkspaceId || ""}
                onValueChange={(value) =>
                  onChange({ ...data, workspaceId: value })
                }
              >
                <SelectTrigger id="workspace">
                  <SelectValue placeholder="Select a workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((workspace: any) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="query">Query</Label>
              <Textarea
                id="query"
                value={data.query || ""}
                onChange={(e) => onChange({ ...data, query: e.target.value })}
                placeholder="Enter your query or use {{variable}} to reference workflow variables"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {{ variable }} syntax to reference variables from previous
                nodes
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="formatResults">Result Format</Label>
              <Select
                value={data.formatResults || "text"}
                onValueChange={(value) =>
                  onChange({ ...data, formatResults: value })
                }
              >
                <SelectTrigger id="formatResults">
                  <SelectValue placeholder="Select result format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="citations-only">Citations Only</SelectItem>
                  <SelectItem value="raw">Raw</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {data.formatResults === "text" &&
                  "Returns context and citations in a readable text format"}
                {data.formatResults === "json" &&
                  "Returns complete structured data in JSON format"}
                {data.formatResults === "compact" &&
                  "Returns a minimal result with just essential information"}
                {data.formatResults === "citations-only" &&
                  "Returns only the citation information"}
                {data.formatResults === "raw" &&
                  "Returns the raw, unprocessed retrieval result"}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="retrieval" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Retrieval Method</Label>
              <Select
                value={data.retrievalMethod || "hybrid"}
                onValueChange={(value) =>
                  onChange({ ...data, retrievalMethod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a retrieval method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semantic">Semantic Search</SelectItem>
                  <SelectItem value="keyword">Keyword Search</SelectItem>
                  <SelectItem value="hybrid">Hybrid Search</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {data.retrievalMethod === "semantic" &&
                  "Uses vector embeddings for concept-based matching"}
                {data.retrievalMethod === "keyword" &&
                  "Uses traditional keyword matching for precision"}
                {data.retrievalMethod === "hybrid" &&
                  "Combines semantic and keyword search for balanced results"}
              </p>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label>Top K Results</Label>
                <span className="text-sm">{data.topK || 5}</span>
              </div>
              <Slider
                value={[data.topK || 5]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => onChange({ ...data, topK: value[0] })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of most relevant documents to retrieve
              </p>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label>Similarity Threshold (%)</Label>
                <span className="text-sm">
                  {data.similarityThreshold || 70}%
                </span>
              </div>
              <Slider
                value={[data.similarityThreshold || 70]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) =>
                  onChange({ ...data, similarityThreshold: value[0] })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum relevance required for documents to be included
              </p>
            </div>

            {data.retrievalMethod === "hybrid" && (
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>Keyword Weight</Label>
                  <span className="text-sm">
                    {data.keywordWeight
                      ? Math.round(data.keywordWeight * 100)
                      : 30}
                    %
                  </span>
                </div>
                <Slider
                  value={[data.keywordWeight ? data.keywordWeight * 100 : 30]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) =>
                    onChange({ ...data, keywordWeight: value[0] / 100 })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Balance between keyword and semantic search (higher = more
                  keyword influence)
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label>Max Context Length</Label>
                <span className="text-sm">
                  {data.maxContextLength || 2000} chars
                </span>
              </div>
              <Slider
                value={[data.maxContextLength || 2000]}
                min={500}
                max={10000}
                step={500}
                onValueChange={(value) =>
                  onChange({ ...data, maxContextLength: value[0] })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum length of the context window in characters
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label>Document Filters</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterForm(true)}
                disabled={showFilterForm}
              >
                Add Filter
              </Button>
            </div>

            {showFilterForm && (
              <Card>
                <CardContent className="pt-4 pb-2">
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="filterKey">Filter Property</Label>
                      <Input
                        id="filterKey"
                        value={filterKey}
                        onChange={(e) => setFilterKey(e.target.value)}
                        placeholder="e.g., documentType, author, category"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="filterValue">Filter Value</Label>
                      <Input
                        id="filterValue"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        placeholder="e.g., pdf, John Doe, technical"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilterForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddFilter}>
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <ScrollArea className="h-[200px] border rounded-md p-2">
              {data.filterOptions &&
              Object.keys(data.filterOptions).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(data.filterOptions).map(
                    ([key, value]: [string, any]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div>
                          <span className="font-medium text-sm">{key}:</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {String(value)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveFilter(key)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[150px] text-center p-4">
                  <Filter className="h-10 w-10 text-muted-foreground/40 mb-4" />
                  <div className="text-sm text-muted-foreground mb-2">
                    No filters configured
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add filters to narrow down document retrieval based on
                    metadata
                  </p>
                </div>
              )}
            </ScrollArea>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-2">
                <span>Document Selection</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2 pb-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    Optionally select specific documents to search within. If
                    none are selected, all documents in the workspace will be
                    searched.
                  </p>

                  <ScrollArea className="h-[200px] border rounded-md p-2">
                    {documents.length > 0 ? (
                      <div className="space-y-2">
                        {documents.map((doc: any) => (
                          <Card
                            key={doc.id}
                            className={`cursor-pointer transition-colors ${
                              selectedDocIds.includes(doc.id)
                                ? "bg-primary/5 border-primary/30"
                                : ""
                            }`}
                          >
                            <CardContent
                              className="p-3"
                              onClick={() => handleDocumentToggle(doc.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <div className="text-sm font-medium">
                                    {doc.name}
                                  </div>
                                </div>
                                <Switch
                                  checked={selectedDocIds.includes(doc.id)}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[150px] text-center p-4">
                        <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-4" />
                        <div className="text-sm text-muted-foreground mb-2">
                          No documents available
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload documents in the Document Manager to use them
                          for retrieval
                        </p>
                      </div>
                    )}
                  </ScrollArea>

                  <div className="flex justify-between mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onChange({ ...data, documents: [] })}
                      disabled={selectedDocIds.length === 0}
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onChange({
                          ...data,
                          documents: documents.map((d: any) => d.id),
                        })
                      }
                      disabled={
                        documents.length === 0 ||
                        selectedDocIds.length === documents.length
                      }
                    >
                      Select All
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Query Processing</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <BrainCircuit className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Query Expansion</span>
                </div>
                <Switch
                  checked={data.useQueryExpansion !== false}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, useQueryExpansion: checked })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enhances queries with additional related terms to improve search
                results
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Result Enhancement</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Enhanced Context</span>
                </div>
                <Switch
                  checked={data.enhancedContext || false}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, enhancedContext: checked })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Generates a more coherent context from retrieved documents
              </p>

              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Generate Citations</span>
                </div>
                <Switch
                  checked={data.generateCitations !== false}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, generateCitations: checked })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Includes source citations for retrieved information
              </p>

              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Include Metadata</span>
                </div>
                <Switch
                  checked={data.includeMetadata !== false}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, includeMetadata: checked })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Includes document metadata in the results
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
