import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listOpenRouterModels, getOpenRouterApiKey, OpenRouterModel } from '@/lib/openRouterService';
import { addOpenRouterModels } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, RefreshCw, ExternalLink, BrainCircuit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

const MODEL_CATEGORIES = [
  { id: 'all', name: 'All Models' },
  { id: 'anthropic', name: 'Anthropic (Claude)' },
  { id: 'google', name: 'Google (Gemini)' },
  { id: 'meta', name: 'Meta (Llama)' },
  { id: 'mistral', name: 'Mistral AI' },
  { id: 'openai', name: 'OpenAI (GPT)' },
  { id: 'other', name: 'Other Providers' },
];

export function OpenRouterModels({ onModelSelect }: { onModelSelect?: (modelId: string) => void }) {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    // Filter models based on search query and category
    let filtered = [...models];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(query) || 
        model.id.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(model => {
        const providerId = model.top_provider?.id.toLowerCase() || '';
        const providerName = model.top_provider?.name.toLowerCase() || '';
        
        switch (selectedCategory) {
          case 'anthropic':
            return providerId.includes('anthropic') || providerName.includes('claude');
          case 'google':
            return providerId.includes('google') || providerName.includes('gemini');
          case 'meta':
            return providerId.includes('meta') || providerName.includes('llama');
          case 'mistral':
            return providerId.includes('mistral');
          case 'openai':
            return providerId.includes('openai') || providerName.includes('gpt');
          case 'other':
            return !(
              providerId.includes('anthropic') || 
              providerId.includes('google') || 
              providerId.includes('meta') || 
              providerId.includes('mistral') || 
              providerId.includes('openai')
            );
          default:
            return true;
        }
      });
    }
    
    // Sort models by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredModels(filtered);
  }, [models, searchQuery, selectedCategory]);

  const loadModels = async () => {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      setError('API key is required to load models');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const modelsList = await listOpenRouterModels(apiKey);
      
      // Add the models to the application's available models
      addOpenRouterModels(modelsList);
      
      // Update the local state
      setModels(modelsList);
      
      if (modelsList.length > 0 && !selectedModelId) {
        setSelectedModelId(modelsList[0].id);
      }
      
      toast({
        title: 'Models Loaded',
        description: `${modelsList.length} OpenRouter models are now available in your model selector`,
      });
    } catch (err) {
      console.error('Failed to load OpenRouter models:', err);
      setError('Failed to load models. Please check your API key and try again.');
      toast({
        title: 'Error Loading Models',
        description: 'Could not load models from OpenRouter. Please check your API key.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    if (onModelSelect) {
      onModelSelect(modelId);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(6)}`;
  };

  // Get provider badge color
  const getProviderColor = (provider: string) => {
    const providerLower = provider.toLowerCase();
    
    if (providerLower.includes('anthropic') || providerLower.includes('claude')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (providerLower.includes('openai') || providerLower.includes('gpt')) {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (providerLower.includes('google') || providerLower.includes('gemini')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (providerLower.includes('meta') || providerLower.includes('llama')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    } else if (providerLower.includes('mistral')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    } else {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-blue-600" />
            OpenRouter Models
          </h3>
          
          {models.length > 0 && (
            <Badge variant="outline">
              {models.length} Available
            </Badge>
          )}
        </div>
        
        <Button variant="outline" size="sm" onClick={loadModels} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {MODEL_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredModels.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No models found matching your criteria</p>
              </div>
            ) : (
              <ScrollArea className="h-[450px] rounded-md">
                <RadioGroup 
                  value={selectedModelId || ''} 
                  onValueChange={handleModelSelect}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1"
                >
                  {filteredModels.map(model => (
                    <div key={model.id} className="relative">
                      <RadioGroupItem 
                        value={model.id} 
                        id={model.id}
                        className="absolute w-full h-full opacity-0 cursor-pointer peer"
                      />
                      <Card className="overflow-hidden h-full peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {model.name}
                          </CardTitle>
                          <div className="flex gap-2 flex-wrap">
                            {model.top_provider && (
                              <Badge 
                                variant="outline" 
                                className={getProviderColor(model.top_provider.name)}
                              >
                                {model.top_provider.name}
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {model.context_length.toLocaleString()} tokens
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Input:</span>
                            <span>{formatPrice(model.pricing.prompt)}/token</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Output:</span>
                            <span>{formatPrice(model.pricing.completion)}/token</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Label 
                            htmlFor={model.id} 
                            className="w-full cursor-pointer"
                          >
                            <Button 
                              type="button" 
                              variant={selectedModelId === model.id ? "default" : "outline"} 
                              className="w-full"
                            >
                              {selectedModelId === model.id ? "Selected" : "Select Model"}
                            </Button>
                          </Label>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </RadioGroup>
              </ScrollArea>
            )}
          </>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          <a 
            href="https://openrouter.ai/docs" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 hover:underline"
          >
            Documentation <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 p-1">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-80">
              <p>OpenRouter provides access to 100+ AI models from providers like Anthropic (Claude), Meta (Llama), Google (Gemini), and more.</p>
              <p className="mt-1">Prices are shown per token and are subject to change.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}