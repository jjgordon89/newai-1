import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Database, Filter, BrainCircuit, BarChart3, Wand2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RAGNodeConfigPanelProps {
  data: any;
  onChange: (id: string, data: any) => void;
  id: string;
}

export const RAGNodeConfigPanel: React.FC<RAGNodeConfigPanelProps> = ({ 
  data, 
  onChange, 
  id 
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  
  const handleChange = (key: string, value: any) => {
    onChange(id, { ...data, [key]: value });
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Database className="h-4 w-4" />
          RAG Configuration
        </h3>
        <Badge variant="outline">Advanced</Badge>
      </div>
      
      <div className="space-y-3 pt-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
            Retrieval Method
          </Label>
          <Select 
            value={data.retrievalMethod || 'hybrid'} 
            onValueChange={(value) => handleChange('retrievalMethod', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select retrieval method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semantic">Semantic Search</SelectItem>
              <SelectItem value="keyword">Keyword Search</SelectItem>
              <SelectItem value="hybrid">Hybrid Search</SelectItem>
              <SelectItem value="mmr">Maximum Marginal Relevance</SelectItem>
              <SelectItem value="reranking">Reranking</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Method used to retrieve relevant documents
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Top K Documents</Label>
            <span className="text-sm font-medium">{data.topK || 3}</span>
          </div>
          <Slider 
            value={[data.topK || 3]} 
            min={1} 
            max={10} 
            step={1}
            onValueChange={([value]) => handleChange('topK', value)}
          />
          <p className="text-xs text-muted-foreground">
            Number of most relevant documents to retrieve
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Relevance Threshold (%)</Label>
            <span className="text-sm font-medium">{data.similarityThreshold || 70}%</span>
          </div>
          <Slider 
            value={[data.similarityThreshold || 70]} 
            min={50} 
            max={95} 
            step={5}
            onValueChange={([value]) => handleChange('similarityThreshold', value)}
          />
          <p className="text-xs text-muted-foreground">
            Minimum relevance score for documents
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="enhanced-context" 
            checked={data.enhancedContext || false}
            onCheckedChange={(checked) => handleChange('enhancedContext', checked)}
          />
          <Label htmlFor="enhanced-context">Enhanced Context</Label>
        </div>

        <Collapsible 
          className="space-y-3 border-t mt-3 pt-3"
          open={showAdvanced}
          onOpenChange={setShowAdvanced}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex w-full justify-between items-center">
              <div className="flex items-center">
                <BrainCircuit className="mr-2 h-4 w-4" />
                <span>Advanced RAG Features</span>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform duration-200" 
                style={{ transform: showAdvanced ? 'rotate(180deg)' : undefined }} 
              />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-3">
              <Label className="flex items-center gap-1">
                <Wand2 className="h-3.5 w-3.5 text-purple-600" />
                Reranker
              </Label>
              <Select 
                value={data.reranker || 'reciprocal-rank-fusion'} 
                onValueChange={(value) => handleChange('reranker', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reranker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="simple">Simple Reranker</SelectItem>
                  <SelectItem value="reciprocal-rank-fusion">Reciprocal Rank Fusion</SelectItem>
                  <SelectItem value="cross-attention">Cross-Attention Reranker</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Reranks retrieved documents to improve relevance
              </p>
            </div>
            
            <div className="space-y-3">
              <Label className="flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                Query Routing
              </Label>
              <Select 
                value={data.queryRouting || 'hybrid'} 
                onValueChange={(value) => handleChange('queryRouting', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select query routing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (All Sources)</SelectItem>
                  <SelectItem value="keyword">Keyword Matching</SelectItem>
                  <SelectItem value="semantic">Semantic Routing</SelectItem>
                  <SelectItem value="hybrid">Hybrid Routing</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Intelligently routes queries to relevant knowledge sources
              </p>
            </div>
            
            {data.retrievalMethod === 'hybrid' && (
              <div className="space-y-3 px-3 py-2 bg-muted/30 rounded-md border">
                <h4 className="text-xs font-medium">Hybrid Search Weights</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Vector Search</Label>
                    <span className="text-xs font-medium">
                      {Math.round((data.hybridSearchWeights?.vector || 0.7) * 100)}%
                    </span>
                  </div>
                  <Slider 
                    value={[(data.hybridSearchWeights?.vector || 0.7) * 100]} 
                    min={0} 
                    max={100} 
                    step={10}
                    onValueChange={([value]) => handleChange('hybridSearchWeights', {
                      vector: value / 100,
                      keyword: 1 - (value / 100)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Keyword Search</Label>
                    <span className="text-xs font-medium">
                      {Math.round((data.hybridSearchWeights?.keyword || 0.3) * 100)}%
                    </span>
                  </div>
                  <Slider 
                    value={[(data.hybridSearchWeights?.keyword || 0.3) * 100]} 
                    min={0} 
                    max={100} 
                    step={10}
                    disabled={true} // This is linked to the vector weight
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Advanced Features</Label>
              
              <div className="flex items-center space-x-2 mt-2">
                <Switch 
                  id="query-expansion" 
                  checked={data.queryExpansion || false}
                  onCheckedChange={(checked) => handleChange('queryExpansion', checked)}
                />
                <Label htmlFor="query-expansion" className="text-sm font-normal">Query Expansion</Label>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Switch 
                  id="include-metadata" 
                  checked={data.includeMetadata || false}
                  onCheckedChange={(checked) => handleChange('includeMetadata', checked)}
                />
                <Label htmlFor="include-metadata" className="text-sm font-normal">Include Metadata</Label>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Switch 
                  id="query-decomposition" 
                  checked={data.enableQueryDecomposition || false}
                  onCheckedChange={(checked) => handleChange('enableQueryDecomposition', checked)}
                />
                <Label htmlFor="query-decomposition" className="text-sm font-normal">Query Decomposition</Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <div className="pt-3 border-t mt-3">
          <Label>Selected Documents</Label>
          <div className="mt-2 bg-muted rounded-md p-2 min-h-24 max-h-48 overflow-y-auto">
            {data.documents && data.documents.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {data.documents.map((doc: any, i: number) => (
                  <li key={i} className="flex items-center gap-1">
                    <Filter className="h-3 w-3 text-blue-500" />
                    <span className="truncate">{doc.title || doc.name || `Document ${i+1}`}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">
                No documents selected. Connect document sources to this node.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};