import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  loadApiKeys, 
  saveApiKey, 
  removeApiKey, 
  testApiKey 
} from '@/redux/slices/apiKeysSlice';
import { ApiProvider } from '@/lib/apiKeyManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Key, 
  Trash, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  TestTube, 
  Plus 
} from 'lucide-react';

// API Provider information for UI
const apiProviderInfo: Record<string, { name: string; description: string; docsUrl: string; }> = {
  'openai': {
    name: 'OpenAI',
    description: 'Access GPT models like GPT-4 and GPT-3.5',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  'anthropic': {
    name: 'Anthropic',
    description: 'Access Claude AI models',
    docsUrl: 'https://console.anthropic.com/keys',
  },
  'google': {
    name: 'Google AI',
    description: 'Access Gemini and other Google AI models',
    docsUrl: 'https://ai.google.dev/',
  },
  'mistral': {
    name: 'Mistral AI',
    description: 'Access Mistral large language models',
    docsUrl: 'https://console.mistral.ai/',
  },
  'hugging face': {
    name: 'Hugging Face',
    description: 'Access to thousands of open-source models',
    docsUrl: 'https://huggingface.co/settings/tokens',
  },
  'openrouter': {
    name: 'OpenRouter',
    description: 'Unified API access to multiple AI providers',
    docsUrl: 'https://openrouter.ai/keys',
  },
  'brave': {
    name: 'Brave Search',
    description: 'Web search API with privacy focus',
    docsUrl: 'https://brave.com/search/api/',
  },
  'serp': {
    name: 'SERP API',
    description: 'Search engine results page scraping API',
    docsUrl: 'https://serpapi.com/dashboard',
  },
  'duckduckgo': {
    name: 'DuckDuckGo',
    description: 'Privacy-focused web search API',
    docsUrl: 'https://duckduckgo.com/api',
  },
  'weather': {
    name: 'Weather API',
    description: 'Access to weather forecast data',
    docsUrl: 'https://openweathermap.org/api',
  },
  'ollama': {
    name: 'Ollama',
    description: 'Local LLM deployment and management',
    docsUrl: 'https://ollama.ai/',
  }
};

// Provider categories
const providerCategories = {
  'ai': ['openai', 'anthropic', 'google', 'mistral', 'hugging face', 'openrouter', 'ollama'],
  'search': ['brave', 'serp', 'duckduckgo'],
  'utilities': ['weather']
};

export function ApiKeyManager() {
  const dispatch = useAppDispatch();
  const { keys, metadata, availableProviders, isLoading, error } = useAppSelector(state => state.apiKeys);
  
  const [activeCategory, setActiveCategory] = useState('ai');
  const [newProvider, setNewProvider] = useState<ApiProvider>('openai');
  const [newApiKey, setNewApiKey] = useState('');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [keyToDelete, setKeyToDelete] = useState<ApiProvider | null>(null);
  
  // Load API keys on mount
  useEffect(() => {
    dispatch(loadApiKeys());
  }, [dispatch]);
  
  // Handle save API key
  const handleSaveApiKey = async () => {
    if (newApiKey.trim()) {
      await dispatch(saveApiKey({
        provider: newProvider,
        key: newApiKey,
        metadata: {
          provider: newProvider,
          lastValidated: new Date(),
        }
      }));
      
      // Clear form
      setNewApiKey('');
    }
  };
  
  // Handle delete API key
  const handleDeleteApiKey = async (provider: ApiProvider) => {
    await dispatch(removeApiKey(provider));
    setKeyToDelete(null);
  };
  
  // Handle test API key
  const handleTestApiKey = async (provider: ApiProvider) => {
    const key = keys[provider];
    if (key) {
      await dispatch(testApiKey({ provider, key }));
    }
  };
  
  // Toggle show/hide API key
  const toggleShowKey = (provider: ApiProvider | 'new') => {
    setShowKey(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };
  
  // Get providers for current category
  const getProvidersForCategory = (category: string) => {
    return providerCategories[category as keyof typeof providerCategories] || [];
  };
  
  // Get available API key options that haven't been added yet
  const getAvailableProviderOptions = () => {
    const categoryProviders = getProvidersForCategory(activeCategory);
    return categoryProviders.filter(p => !availableProviders.includes(p as ApiProvider));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          Manage API keys for various services and integrations
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="ai" onValueChange={setActiveCategory}>
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="ai">AI Models</TabsTrigger>
            <TabsTrigger value="search">Search APIs</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
          </TabsList>
        </div>
        
        {['ai', 'search', 'utilities'].map(category => (
          <TabsContent key={category} value={category} className="p-0">
            <CardContent className="pt-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Add new API key form */}
              <div className="mb-6 p-4 border rounded-md bg-muted/20">
                <h3 className="text-sm font-medium mb-3">Add New API Key</h3>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  <div className="md:col-span-2">
                    <Select 
                      value={newProvider} 
                      onValueChange={(value) => setNewProvider(value as ApiProvider)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {getProvidersForCategory(category).map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {apiProviderInfo[provider]?.name || provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-3">
                    <Input
                      type={showKey['new'] ? "text" : "password"}
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="Enter API key"
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-grow"
                      onClick={() => toggleShowKey('new')}
                    >
                      {showKey['new'] ? 'Hide' : 'Show'}
                    </Button>
                    <Button 
                      onClick={handleSaveApiKey} 
                      disabled={isLoading || !newApiKey.trim()} 
                      className="flex-grow"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Key
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {newProvider && apiProviderInfo[newProvider] && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    <p>{apiProviderInfo[newProvider].description}</p>
                    <a 
                      href={apiProviderInfo[newProvider].docsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center mt-1"
                    >
                      Get API key from {apiProviderInfo[newProvider].name}
                    </a>
                  </div>
                )}
              </div>
              
              {/* Existing API keys */}
              <div>
                <h3 className="text-sm font-medium mb-3">Saved API Keys</h3>
                
                {availableProviders.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No API keys added yet for this category</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getProvidersForCategory(category)
                      .filter(provider => availableProviders.includes(provider as ApiProvider))
                      .map(provider => {
                        const apiProvider = provider as ApiProvider;
                        const key = keys[apiProvider];
                        const meta = metadata[apiProvider];
                        
                        return (
                          <div key={provider} className="p-3 border rounded-md bg-background">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium flex items-center">
                                  {apiProviderInfo[provider]?.name || provider}
                                  {meta?.isValid && (
                                    <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {meta?.lastValidated ? (
                                    <>Last validated: {new Date(meta.lastValidated).toLocaleString()}</>
                                  ) : (
                                    <>Not validated yet</>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleShowKey(apiProvider)}
                                >
                                  {showKey[apiProvider] ? 'Hide' : 'Show'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestApiKey(apiProvider)}
                                >
                                  <TestTube className="mr-1 h-4 w-4" />
                                  Test
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => setKeyToDelete(apiProvider)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete your {apiProviderInfo[provider]?.name || provider} API key? 
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setKeyToDelete(null)}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={() => handleDeleteApiKey(apiProvider)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            
                            {showKey[apiProvider] && key && (
                              <div className="mt-2 pt-2 border-t">
                                <Input 
                                  readOnly 
                                  value={key}
                                  className="font-mono text-xs"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>
        ))}
      </Tabs>
      
      <CardFooter className="flex justify-between px-6 py-4 border-t">
        <p className="text-xs text-muted-foreground">
          API keys are stored securely in browser storage
        </p>
        <div>
          <Badge variant="outline" className="text-xs">
            {availableProviders.length} keys saved
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}