import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, 
  Search, 
  Sliders, 
  Sparkles, 
  FileText, 
  BarChart3, 
  BookOpen, 
  BrainCircuit,
  Bot,
  Wand2
} from 'lucide-react';

interface LanceDbRagNodePanelProps {
  data: any;
  onChange: (data: any) => void;
}

export const LanceDbRagNodePanel: React.FC<LanceDbRagNodePanelProps> = ({ data, onChange }) => {
  const { activeWorkspaceId, listDocuments } = useWorkspace();
  const documents = listDocuments(activeWorkspaceId || '') || [];
  
  const [activeTab, setActiveTab] = useState('basic');
  
  // Get selected document ids
  const selectedDocIds = data.documents || [];
  
  // Handle document selection
  const handleDocumentToggle = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      onChange({
        ...data,
        documents: selectedDocIds.filter((id: string) => id !== docId)
      });
    } else {
      onChange({
        ...data,
        documents: [...selectedDocIds, docId]
      });
    }
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="text-base font-medium">LanceDB Vector Search</h3>
        </div>
        <Badge className="bg-primary/10 text-primary">RAG</Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nodeTitle">Node Title</Label>
              <Input
                id="nodeTitle"
                value={data.title || "Vector Search"}
                onChange={(e) => onChange({ ...data, title: e.target.value })}
                placeholder="Enter a title for this node"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Retrieval Method</Label>
              <Select
                value={data.retrievalMethod || "hybrid"}
                onValueChange={(value) => onChange({ ...data, retrievalMethod: value })}
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
                {data.retrievalMethod === 'semantic' && 'Uses vector embeddings for concept-based matching.'}
                {data.retrievalMethod === 'keyword' && 'Uses traditional keyword matching for precision.'}
                {data.retrievalMethod === 'hybrid' && 'Combines semantic and keyword search for balanced results.'}
              </p>
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label>Top K Results</Label>
                <span className="text-sm">{data.topK || 3}</span>
              </div>
              <Slider
                value={[data.topK || 3]}
                min={1}
                max={10}
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
                <span className="text-sm">{data.similarityThreshold || 70}%</span>
              </div>
              <Slider
                value={[data.similarityThreshold || 70]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => onChange({ ...data, similarityThreshold: value[0] })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum relevance required for documents to be included
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Select Documents</div>
            <div className="text-sm text-muted-foreground">
              {selectedDocIds.length} selected
            </div>
          </div>
          
          <ScrollArea className="h-[300px] border rounded-md p-2">
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <Card key={doc.id} className={`cursor-pointer transition-colors ${
                    selectedDocIds.includes(doc.id) ? 'bg-primary/5 border-primary/30' : ''
                  }`}>
                    <CardContent className="p-3" onClick={() => handleDocumentToggle(doc.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <div className="text-sm font-medium">{doc.name}</div>
                        </div>
                        <Switch checked={selectedDocIds.includes(doc.id)} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
                <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-4" />
                <div className="text-sm text-muted-foreground mb-2">No documents available</div>
                <CardDescription>
                  Upload documents in the Document Manager to use them for RAG operations
                </CardDescription>
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-between">
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
              onClick={() => onChange({ ...data, documents: documents.map((d: any) => d.id) })}
              disabled={documents.length === 0 || selectedDocIds.length === documents.length}
            >
              Select All
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Reranker</Label>
              <Select
                value={data.reranker || "reciprocal-rank-fusion"}
                onValueChange={(value) => onChange({ ...data, reranker: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reranker method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Reranking</SelectItem>
                  <SelectItem value="simple">Simple Reranking</SelectItem>
                  <SelectItem value="reciprocal-rank-fusion">Reciprocal Rank Fusion</SelectItem>
                  <SelectItem value="cross-attention">Cross-Attention Reranking</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Rerankers improve result relevance by reordering initial search results
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label>Query Expansion</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <BrainCircuit className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">AI Query Expansion</span>
                </div>
                <Switch
                  checked={data.useQueryExpansion || false}
                  onCheckedChange={(checked) => onChange({ ...data, useQueryExpansion: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enhances queries with additional related terms to improve search results
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label>Query Routing</Label>
              <Select
                value={data.queryRouting || "basic"}
                onValueChange={(value) => onChange({ ...data, queryRouting: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a routing method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (All Sources)</SelectItem>
                  <SelectItem value="keyword">Keyword-Based Routing</SelectItem>
                  <SelectItem value="semantic">Semantic Routing</SelectItem>
                  <SelectItem value="hybrid">Hybrid Routing</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Determines which knowledge sources to query based on the input
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">LanceDB Features</span>
              </div>
              
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Context Generation</span>
                </div>
                <Switch
                  checked={data.enhancedContext || true}
                  onCheckedChange={(checked) => onChange({ ...data, enhancedContext: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Auto Summarization</span>
                </div>
                <Switch
                  checked={data.summarization || false}
                  onCheckedChange={(checked) => onChange({ ...data, summarization: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Citation Generation</span>
                </div>
                <Switch
                  checked={data.generateCitations || true}
                  onCheckedChange={(checked) => onChange({ ...data, generateCitations: checked })}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};