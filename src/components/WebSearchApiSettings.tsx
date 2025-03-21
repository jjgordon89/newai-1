import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Search, Globe, Database } from 'lucide-react';
import { BraveApiKeyForm } from './BraveApiKeyForm';
import { GoogleApiKeyForm } from './GoogleApiKeyForm';
import { DuckDuckGoApiKeyForm } from './DuckDuckGoApiKeyForm';
import { SerpApiKeyForm } from './SerpApiKeyForm';
import {
  getPreferredSearchEngine,
  setPreferredSearchEngine,
  SearchEngine,
  getBraveApiKey,
  getGoogleApiKey,
  getDuckDuckGoApiKey,
  getSerpApiKey
} from '@/lib/webSearchService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Workspace } from '@/context/WorkspaceContext';

interface WebSearchApiSettingsProps {
  workspace?: Workspace;
  onUpdateKeys?: (provider: string, key: string) => void;
  onUpdatePreferredEngine?: (engine: SearchEngine) => void;
}

export function WebSearchApiSettings({ 
  workspace, 
  onUpdateKeys,
  onUpdatePreferredEngine 
}: WebSearchApiSettingsProps) {
  const [activeTab, setActiveTab] = useState<SearchEngine>(
    workspace?.settings?.webSearch?.preferredEngine as SearchEngine || 
    getPreferredSearchEngine()
  );

  // Handle search engine change
  const handleSearchEngineChange = (value: string) => {
    const engine = value as SearchEngine;
    setActiveTab(engine);
    
    // Update workspace settings if in workspace context
    if (onUpdatePreferredEngine) {
      onUpdatePreferredEngine(engine);
    } else {
      // Or fall back to global settings
      setPreferredSearchEngine(engine);
    }
  };

  // Get API key from workspace or global storage
  const getApiKey = (provider: string): string => {
    if (workspace?.settings?.webSearch?.[provider]?.apiKey) {
      return workspace.settings.webSearch[provider].apiKey;
    }
    
    // Fall back to global storage if no workspace key
    switch (provider) {
      case 'brave': return getBraveApiKey() || '';
      case 'google': return getGoogleApiKey() || '';
      case 'duckduckgo': return getDuckDuckGoApiKey() || '';
      case 'serpapi': return getSerpApiKey() || '';
      default: return '';
    }
  };

  // Custom API key form handling
  const handleApiKeySave = (provider: string, key: string) => {
    if (onUpdateKeys) {
      onUpdateKeys(provider, key);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Web Search Providers</h2>
        <p className="text-sm text-muted-foreground">
          Configure API keys for different web search providers to enable real-time information retrieval
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleSearchEngineChange} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="brave" className="flex items-center gap-2">
            <Search className="h-4 w-4 text-purple-500" />
            <span>Brave</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            <span>Google</span>
          </TabsTrigger>
          <TabsTrigger value="duckduckgo" className="flex items-center gap-2">
            <Search className="h-4 w-4 text-orange-500" />
            <span>DuckDuckGo</span>
          </TabsTrigger>
          <TabsTrigger value="serpapi" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>SerpAPI</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brave" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Brave Search API</CardTitle>
              <CardDescription>
                Brave Search provides a privacy-focused search engine with high-quality results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BraveApiKeyForm 
                initialApiKey={getApiKey('brave')}
                onSave={(key) => handleApiKeySave('brave', key)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Search API</CardTitle>
              <CardDescription>
                Access Google's comprehensive search capabilities for the most relevant results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleApiKeyForm 
                initialApiKey={getApiKey('google')}
                onSave={(key) => handleApiKeySave('google', key)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duckduckgo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>DuckDuckGo API</CardTitle>
              <CardDescription>
                Privacy-focused search engine that doesn't track your searches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DuckDuckGoApiKeyForm 
                initialApiKey={getApiKey('duckduckgo')}
                onSave={(key) => handleApiKeySave('duckduckgo', key)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="serpapi" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SerpAPI</CardTitle>
              <CardDescription>
                Access search engine results from various providers through a unified API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SerpApiKeyForm 
                initialApiKey={getApiKey('serpapi')}
                onSave={(key) => handleApiKeySave('serpapi', key)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
