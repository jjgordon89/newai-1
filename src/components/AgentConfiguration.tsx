import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Brain,
  GraduationCap,
  FileText,
  Globe,
  Save,
  BarChart,
  Bot,
  Settings,
  Workflow,
  MessageSquare,
  Search,
  BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AgentSkills } from './AgentSkills';

export interface AgentConfig {
  name: string;
  description: string;
  model: string;
  temperature: number;
  maxTokens: number;
  personality: string;
  skills: {
    rag: boolean;
    continuousLearning: boolean;
    documentAnalysis: boolean;
    webSearch: boolean;
    fileGeneration: boolean;
    chartVisualization: boolean;
  };
  memory: {
    enabled: boolean;
    contextWindow: number;
    messageRetention: 'short' | 'medium' | 'long' | 'unlimited';
  };
  ragSettings: {
    chunkSize: number;
    chunkOverlap: number;
    similarityThreshold: number;
    maxRetrievedDocs: number;
  };
  responseStyle: {
    verbosity: 'concise' | 'balanced' | 'detailed';
    formality: 'casual' | 'neutral' | 'formal';
    creativity: number;
  };
}

const defaultConfig: AgentConfig = {
  name: 'New Agent',
  description: 'A helpful AI assistant',
  model: 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  personality: 'I am a helpful, friendly assistant that specializes in answering questions accurately and concisely.',
  skills: {
    rag: true,
    continuousLearning: true,
    documentAnalysis: true,
    webSearch: true,
    fileGeneration: true,
    chartVisualization: true
  },
  memory: {
    enabled: true,
    contextWindow: 10,
    messageRetention: 'medium'
  },
  ragSettings: {
    chunkSize: 1024,
    chunkOverlap: 200,
    similarityThreshold: 0.7,
    maxRetrievedDocs: 5
  },
  responseStyle: {
    verbosity: 'balanced',
    formality: 'neutral',
    creativity: 0.6
  }
};

interface AgentConfigurationProps {
  initialConfig?: Partial<AgentConfig>;
  onConfigChange: (config: AgentConfig) => void;
}

export const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  initialConfig,
  onConfigChange
}) => {
  const [config, setConfig] = useState<AgentConfig>({
    ...defaultConfig,
    ...initialConfig
  });
  
  useEffect(() => {
    onConfigChange(config);
  }, [config, onConfigChange]);
  
  const updateConfig = <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const updateSkill = (skill: keyof AgentConfig['skills'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skill]: value
      }
    }));
  };
  
  const updateMemory = <K extends keyof AgentConfig['memory']>(key: K, value: AgentConfig['memory'][K]) => {
    setConfig(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        [key]: value
      }
    }));
  };
  
  const updateRagSettings = <K extends keyof AgentConfig['ragSettings']>(key: K, value: AgentConfig['ragSettings'][K]) => {
    setConfig(prev => ({
      ...prev,
      ragSettings: {
        ...prev.ragSettings,
        [key]: value
      }
    }));
  };
  
  const updateResponseStyle = <K extends keyof AgentConfig['responseStyle']>(key: K, value: AgentConfig['responseStyle'][K]) => {
    setConfig(prev => ({
      ...prev,
      responseStyle: {
        ...prev.responseStyle,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Basic Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                value={config.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                placeholder="My Assistant"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agent-model">Base Model</Label>
              <Select
                value={config.model}
                onValueChange={(value) => updateConfig('model', value)}
              >
                <SelectTrigger id="agent-model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="custom">Custom Fine-tuned Model</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea
              id="agent-description"
              value={config.description}
              onChange={(e) => updateConfig('description', e.target.value)}
              placeholder="Describe what this agent is designed to do"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent-personality">Personality & Instructions</Label>
            <Textarea
              id="agent-personality"
              value={config.personality}
              onChange={(e) => updateConfig('personality', e.target.value)}
              placeholder="Define the personality, tone, and specific instructions for this agent"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Brain className="h-4 w-4" /> Skills
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Memory
          </TabsTrigger>
          <TabsTrigger value="rag" className="flex items-center gap-2">
            <Search className="h-4 w-4" /> RAG Settings
          </TabsTrigger>
          <TabsTrigger value="response" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Response Style
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="skills" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Agent Skills</CardTitle>
              <CardDescription>
                Enable or disable capabilities for this agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <div>
                      <Label>RAG & Memory</Label>
                      <p className="text-sm text-muted-foreground">
                        Knowledge retrieval from documents
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.skills.rag}
                    onCheckedChange={(checked) => updateSkill('rag', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <div>
                      <Label>Continuous Learning</Label>
                      <p className="text-sm text-muted-foreground">
                        Adapt to user preferences over time
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.skills.continuousLearning}
                    onCheckedChange={(checked) => updateSkill('continuousLearning', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <Label>Document Analysis</Label>
                      <p className="text-sm text-muted-foreground">
                        Summarize and extract information
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.skills.documentAnalysis}
                    onCheckedChange={(checked) => updateSkill('documentAnalysis', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <Label>Web Search</Label>
                      <p className="text-sm text-muted-foreground">
                        Retrieve information from the internet
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.skills.webSearch}
                    onCheckedChange={(checked) => updateSkill('webSearch', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <Save className="h-5 w-5 text-primary" />
                    <div>
                      <Label>File Generation</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate and save files
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.skills.fileGeneration}
                    onCheckedChange={(checked) => updateSkill('fileGeneration', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-5 w-5 text-primary" />
                    <div>
                      <Label>Chart Visualization</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate charts and graphs
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.skills.chartVisualization}
                    onCheckedChange={(checked) => updateSkill('chartVisualization', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="memory" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Memory Configuration</CardTitle>
              <CardDescription>
                Configure how the agent remembers past interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Enable Memory</Label>
                    <p className="text-sm text-muted-foreground">
                      Remember past conversations
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.memory.enabled}
                  onCheckedChange={(checked) => updateMemory('enabled', checked)}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="context-window">Context Window</Label>
                  <span className="text-sm text-muted-foreground">{config.memory.contextWindow} messages</span>
                </div>
                <Slider
                  id="context-window"
                  disabled={!config.memory.enabled}
                  min={1}
                  max={20}
                  step={1}
                  value={[config.memory.contextWindow]}
                  onValueChange={(value) => updateMemory('contextWindow', value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Number of conversation turns to include in each query
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message-retention">Message Retention</Label>
                <Select
                  disabled={!config.memory.enabled}
                  value={config.memory.messageRetention}
                  onValueChange={(value: 'short' | 'medium' | 'long' | 'unlimited') => updateMemory('messageRetention', value)}
                >
                  <SelectTrigger id="message-retention">
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (24 hours)</SelectItem>
                    <SelectItem value="medium">Medium (7 days)</SelectItem>
                    <SelectItem value="long">Long (30 days)</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rag" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>RAG Configuration</CardTitle>
              <CardDescription>
                Configure how the agent retrieves and uses document knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="chunk-size">Chunk Size</Label>
                  <span className="text-sm text-muted-foreground">{config.ragSettings.chunkSize} tokens</span>
                </div>
                <Slider
                  id="chunk-size"
                  min={256}
                  max={2048}
                  step={128}
                  value={[config.ragSettings.chunkSize]}
                  onValueChange={(value) => updateRagSettings('chunkSize', value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Size of document chunks for embedding and retrieval
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="chunk-overlap">Chunk Overlap</Label>
                  <span className="text-sm text-muted-foreground">{config.ragSettings.chunkOverlap} tokens</span>
                </div>
                <Slider
                  id="chunk-overlap"
                  min={0}
                  max={512}
                  step={32}
                  value={[config.ragSettings.chunkOverlap]}
                  onValueChange={(value) => updateRagSettings('chunkOverlap', value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Overlap between consecutive document chunks
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="similarity-threshold">Similarity Threshold</Label>
                  <span className="text-sm text-muted-foreground">{config.ragSettings.similarityThreshold.toFixed(2)}</span>
                </div>
                <Slider
                  id="similarity-threshold"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={[config.ragSettings.similarityThreshold]}
                  onValueChange={(value) => updateRagSettings('similarityThreshold', value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Minimum similarity score for retrieved documents
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-docs">Max Retrieved Documents</Label>
                  <span className="text-sm text-muted-foreground">{config.ragSettings.maxRetrievedDocs} documents</span>
                </div>
                <Slider
                  id="max-docs"
                  min={1}
                  max={10}
                  step={1}
                  value={[config.ragSettings.maxRetrievedDocs]}
                  onValueChange={(value) => updateRagSettings('maxRetrievedDocs', value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of documents to retrieve for each query
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="response" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Response Style</CardTitle>
              <CardDescription>
                Configure how the agent responds and communicates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verbosity">Verbosity</Label>
                <Select
                  value={config.responseStyle.verbosity}
                  onValueChange={(value: 'concise' | 'balanced' | 'detailed') => updateResponseStyle('verbosity', value)}
                >
                  <SelectTrigger id="verbosity">
                    <SelectValue placeholder="Select verbosity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise (Shorter responses)</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="detailed">Detailed (Longer responses)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="formality">Formality</Label>
                <Select
                  value={config.responseStyle.formality}
                  onValueChange={(value: 'casual' | 'neutral' | 'formal') => updateResponseStyle('formality', value)}
                >
                  <SelectTrigger id="formality">
                    <SelectValue placeholder="Select formality level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual (Conversational)</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="formal">Formal (Professional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="creativity">Creativity</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(config.responseStyle.creativity * 100)}%</span>
                </div>
                <Slider
                  id="creativity"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[config.responseStyle.creativity]}
                  onValueChange={(value) => updateResponseStyle('creativity', value[0])}
                />
                <div className="flex justify-between text-sm text-muted-foreground pt-1">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">Temperature</Label>
                  <span className="text-sm text-muted-foreground">{config.temperature.toFixed(2)}</span>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[config.temperature]}
                  onValueChange={(value) => updateConfig('temperature', value[0])}
                />
                <div className="flex justify-between text-sm text-muted-foreground pt-1">
                  <span>Deterministic</span>
                  <span>Random</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-tokens">Max Output Tokens</Label>
                  <span className="text-sm text-muted-foreground">{config.maxTokens} tokens</span>
                </div>
                <Slider
                  id="max-tokens"
                  min={256}
                  max={4096}
                  step={256}
                  value={[config.maxTokens]}
                  onValueChange={(value) => updateConfig('maxTokens', value[0])}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};