import React, { useState, useEffect } from 'react';
import { BotIcon, Brain, BookOpen, Search, Zap, PlugZap, ListTodo } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AgentNodeConfig } from '@/lib/workflowTypes';
import { AVAILABLE_MODELS } from '@/lib/api';

interface AgentNodePanelProps {
  nodeId: string;
  data: Partial<AgentNodeConfig>;
  onUpdate: (nodeId: string, data: Partial<AgentNodeConfig>) => void;
}

const AVAILABLE_SKILLS = [
  { id: 'rag', name: 'Knowledge Retrieval (RAG)', description: 'Retrieve relevant information from documents', icon: BookOpen },
  { id: 'web-search', name: 'Web Search', description: 'Search the internet for information', icon: Search },
  { id: 'code', name: 'Code Generation', description: 'Write and explain code', icon: Zap },
  { id: 'tools', name: 'Tool Use', description: 'Use external tools and APIs', icon: PlugZap },
  { id: 'planning', name: 'Task Planning', description: 'Break down complex tasks into steps', icon: ListTodo }
];

export function AgentNodePanel({ nodeId, data, onUpdate }: AgentNodePanelProps) {
  const [config, setConfig] = useState<Partial<AgentNodeConfig>>({
    name: 'AI Agent',
    description: 'A customizable AI agent with various capabilities',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are a helpful, friendly AI assistant.',
    skills: ['rag'],
    memory: {
      enabled: true,
      contextWindow: 10
    },
    tools: [],
    ragSettings: {
      enabled: true,
      similarityThreshold: 0.7,
      maxRetrievedDocs: 3
    },
    ...data
  });

  // Filter out OpenRouter models
  const allModels = [...AVAILABLE_MODELS];
  const openRouterModels = allModels.filter(model => model.provider === 'openrouter');
  const standardModels = allModels.filter(model => model.provider !== 'openrouter');

  useEffect(() => {
    onUpdate(nodeId, config);
  }, [config, nodeId, onUpdate]);

  const updateConfig = <K extends keyof AgentNodeConfig>(key: K, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateMemorySettings = <K extends keyof Required<AgentNodeConfig>['memory']>(
    key: K, 
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        [key]: value
      }
    }));
  };

  const updateRagSettings = <K extends keyof Required<AgentNodeConfig>['ragSettings']>(
    key: K, 
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      ragSettings: {
        ...prev.ragSettings,
        [key]: value
      }
    }));
  };

  const toggleSkill = (skillId: string) => {
    setConfig(prev => {
      const currentSkills = prev.skills || [];
      
      if (currentSkills.includes(skillId)) {
        return {
          ...prev,
          skills: currentSkills.filter(id => id !== skillId)
        };
      } else {
        return {
          ...prev,
          skills: [...currentSkills, skillId]
        };
      }
    });
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BotIcon className="h-4 w-4 text-primary" />
            Agent Configuration
          </CardTitle>
          <CardDescription>Configure your AI agent's capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Name</Label>
            <Input
              id="agent-name"
              value={config.name || ''}
              onChange={(e) => updateConfig('name', e.target.value)}
              placeholder="Enter agent name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea
              id="agent-description"
              value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              placeholder="Describe what this agent does"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="model" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="model" className="text-xs">Model Settings</TabsTrigger>
          <TabsTrigger value="skills" className="text-xs">Skills & Capabilities</TabsTrigger>
          <TabsTrigger value="memory" className="text-xs">Memory & Context</TabsTrigger>
        </TabsList>
        
        <TabsContent value="model" className="space-y-4 mt-0">
          <div className="space-y-2">
            <Label htmlFor="agent-model">AI Model</Label>
            <Select
              value={config.model || 'gpt-4'}
              onValueChange={(value) => updateConfig('model', value)}
            >
              <SelectTrigger id="agent-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loading" disabled>Standard Models</SelectItem>
                {standardModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
                
                {openRouterModels.length > 0 && (
                  <>
                    <SelectItem value="separator" disabled>
                      ── OpenRouter Models ──
                    </SelectItem>
                    {openRouterModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              value={config.systemPrompt || ''}
              onChange={(e) => updateConfig('systemPrompt', e.target.value)}
              placeholder="Instructions for how the agent should behave"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature</Label>
              <span className="text-xs text-muted-foreground">{(config.temperature || 0.7).toFixed(1)}</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[config.temperature || 0.7]}
              onValueChange={(values) => updateConfig('temperature', values[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Deterministic</span>
              <span>Creative</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-tokens">Max Output Tokens</Label>
              <span className="text-xs text-muted-foreground">{config.maxTokens || 2048}</span>
            </div>
            <Slider
              id="max-tokens"
              min={256}
              max={4096}
              step={256}
              value={[config.maxTokens || 2048]}
              onValueChange={(values) => updateConfig('maxTokens', values[0])}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="skills" className="space-y-4 mt-0">
          <div className="grid gap-3">
            {AVAILABLE_SKILLS.map(skill => {
              const isEnabled = config.skills?.includes(skill.id);
              const SkillIcon = skill.icon;
              
              return (
                <div 
                  key={skill.id} 
                  className={`flex items-start p-3 rounded-md border ${isEnabled ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}
                >
                  <Checkbox 
                    id={`skill-${skill.id}`}
                    checked={isEnabled}
                    onCheckedChange={() => toggleSkill(skill.id)}
                    className="mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <Label 
                      htmlFor={`skill-${skill.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <SkillIcon className="h-4 w-4 text-primary" />
                      <span>{skill.name}</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {skill.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {config.skills?.includes('rag') && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rag-enabled" className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <span>Enable RAG Retrieval</span>
                  </Label>
                  <Switch
                    id="rag-enabled"
                    checked={config.ragSettings?.enabled || false}
                    onCheckedChange={(checked) => updateRagSettings('enabled', checked)}
                  />
                </div>
                
                {config.ragSettings?.enabled && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="similarity-threshold">Similarity Threshold</Label>
                        <span className="text-xs text-muted-foreground">
                          {(config.ragSettings?.similarityThreshold || 0.7).toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        id="similarity-threshold"
                        min={0.1}
                        max={0.9}
                        step={0.05}
                        value={[config.ragSettings?.similarityThreshold || 0.7]}
                        onValueChange={(values) => updateRagSettings('similarityThreshold', values[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="max-docs">Max Retrieved Documents</Label>
                        <span className="text-xs text-muted-foreground">
                          {config.ragSettings?.maxRetrievedDocs || 3}
                        </span>
                      </div>
                      <Slider
                        id="max-docs"
                        min={1}
                        max={10}
                        step={1}
                        value={[config.ragSettings?.maxRetrievedDocs || 3]}
                        onValueChange={(values) => updateRagSettings('maxRetrievedDocs', values[0])}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="memory" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <Label htmlFor="memory-enabled" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Enable Conversation Memory</span>
            </Label>
            <Switch
              id="memory-enabled"
              checked={config.memory?.enabled || false}
              onCheckedChange={(checked) => updateMemorySettings('enabled', checked)}
            />
          </div>
          
          {config.memory?.enabled && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="context-window">Context Window</Label>
                  <span className="text-xs text-muted-foreground">
                    {config.memory?.contextWindow || 10} messages
                  </span>
                </div>
                <Slider
                  id="context-window"
                  min={1}
                  max={20}
                  step={1}
                  value={[config.memory?.contextWindow || 10]}
                  onValueChange={(values) => updateMemorySettings('contextWindow', values[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Number of previous messages to include in each prompt
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}