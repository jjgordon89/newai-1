import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Settings,
  Search,
  Bot,
  Database,
  ArrowDownToLine,
  ArrowUpFromLine,
  Key
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { WebSearchApiSettings } from './WebSearchApiSettings';
import { ApiKeySettings } from './ApiKeySettings';
import EmbeddingModelSelector from './EmbeddingModelSelector';
import { AdvancedRagSettings } from './AdvancedRagSettings';
import { AgentConfiguration } from './AgentConfiguration';

export function WorkspaceSettings({ workspaceId, onClose }: { workspaceId: string, onClose?: () => void }) {
  const { workspaces, updateWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('api-keys');
  
  const currentWorkspace = workspaces.find(w => w.id === workspaceId);
  
  if (!currentWorkspace) {
    return <div>Workspace not found</div>;
  }

  const handleSettingsChange = (section: string, data: any) => {
    if (!currentWorkspace) return;
    
    const updatedSettings = {
      ...currentWorkspace.settings || {},
      [section]: {
        ...(currentWorkspace.settings?.[section] || {}),
        ...data
      }
    };
    
    updateWorkspace(workspaceId, { 
      settings: updatedSettings 
    });
  };

  const handleAgentConfigChange = (config: any) => {
    if (!currentWorkspace) return;
    updateWorkspace(workspaceId, { agentConfig: config });
  };

  const handleExportSettings = () => {
    if (!currentWorkspace || !currentWorkspace.settings) return;
    
    const settingsData = JSON.stringify(currentWorkspace.settings, null, 2);
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkspace.name.replace(/\s+/g, '_')}_settings.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const settings = JSON.parse(event.target?.result as string);
            updateWorkspace(workspaceId, { settings });
          } catch (error) {
            console.error('Error importing settings:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{currentWorkspace.name} Settings</h1>
          <p className="text-muted-foreground">
            Configure settings for this workspace
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportSettings}>
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportSettings}>
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Import Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="api-keys" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="web-search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Web Search</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span>Models</span>
          </TabsTrigger>
          <TabsTrigger value="rag" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>RAG</span>
          </TabsTrigger>
          <TabsTrigger value="agent" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Agent</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Provider API Keys</CardTitle>
              <CardDescription>
                Configure API keys for different AI model providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeySettings 
                workspace={currentWorkspace} 
                onUpdateKeys={(provider, key) => {
                  handleSettingsChange('apiKeys', { [provider]: key });
                }} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web-search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Search APIs</CardTitle>
              <CardDescription>
                Configure web search providers for real-time information retrieval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebSearchApiSettings 
                workspace={currentWorkspace}
                onUpdateKeys={(provider, key) => {
                  handleSettingsChange('webSearch', { 
                    [provider]: { apiKey: key } 
                  });
                }}
                onUpdatePreferredEngine={(engine) => {
                  handleSettingsChange('webSearch', { 
                    preferredEngine: engine 
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>
                Configure embedding and language models for this workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <EmbeddingModelSelector
                  defaultModelId={currentWorkspace.settings?.models?.embeddingModel || 'BAAI/bge-small-en-v1.5'}
                  defaultUseHuggingFace={currentWorkspace.settings?.models?.useHuggingFace !== false}
                  onChange={(modelId, useHuggingFace) => {
                    handleSettingsChange('models', {
                      embeddingModel: modelId,
                      useHuggingFace: useHuggingFace
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rag" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RAG Configuration</CardTitle>
              <CardDescription>
                Configure Retrieval Augmented Generation settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AdvancedRagSettings
                  settings={currentWorkspace.settings?.rag || {}}
                  onSettingsChange={(ragSettings) => {
                    handleSettingsChange('rag', ragSettings);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>
                Configure agent capabilities and behaviors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentConfiguration 
                initialConfig={currentWorkspace.agentConfig}
                onConfigChange={handleAgentConfigChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Configure document processing and storage settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                Document management settings will be available in a future update.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {onClose && (
        <div className="flex justify-end">
          <Button onClick={onClose}>
            Close Settings
          </Button>
        </div>
      )}
    </div>
  );
}