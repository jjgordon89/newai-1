import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Cpu, RefreshCw, Server } from 'lucide-react';
import { listOllamaModels, OllamaModel, checkOllamaStatus } from '@/lib/ollamaService';
import { useChat } from '@/context/ChatContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export function OllamaModels() {
  const { setActiveModel } = useChat();
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if Ollama is running
      const status = await checkOllamaStatus();
      setIsConnected(status);
      
      if (!status) {
        setError('Could not connect to Ollama server. Make sure Ollama is running.');
        setIsLoading(false);
        return;
      }
      
      // If connected, fetch models
      const ollamaModels = await listOllamaModels();
      setModels(ollamaModels);
    } catch (err) {
      setError('Failed to load Ollama models. Please check your connection.');
      console.error('Error fetching Ollama models:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSelectModel = (model: OllamaModel) => {
    setActiveModel({
      id: `ollama:${model.name}`,
      name: model.name,
      description: `${model.details.family} (${model.details.parameter_size}) - Local Ollama model`,
      task: 'text-generation'
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isConnected && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Server className="h-5 w-5" /> Ollama Models
          </h3>
          <Button size="sm" variant="outline" onClick={fetchModels}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </div>
        
        <Alert className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertDescription>
            Could not connect to Ollama server. Please make sure Ollama is running on your computer and properly configured in the settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Server className="h-5 w-5" /> Ollama Models
        </h3>
        <Button size="sm" variant="outline" onClick={fetchModels} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <Alert className="bg-red-50 text-red-800 border-red-200">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isLoading ? (
          // Show skeletons while loading
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4 h-[120px] flex flex-col justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </Card>
          ))
        ) : models.length > 0 ? (
          models.map((model) => (
            <Card 
              key={model.name} 
              className="p-4 hover:border-primary cursor-pointer transition-all"
              onClick={() => handleSelectModel(model)}
            >
              <div className="flex items-start gap-2">
                <BrainCircuit className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <h5 className="font-medium">{model.name}</h5>
                  <p className="text-sm text-muted-foreground">
                    {model.details.family} ({model.details.parameter_size})
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      Local Model
                    </span>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {formatBytes(model.size)}
                    </span>
                    {model.details.quantization_level && (
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {model.details.quantization_level}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2 p-8 text-center border rounded-md bg-muted/20">
            <p className="text-muted-foreground mb-2">No Ollama models found.</p>
            <p className="text-sm">
              Pull models using the Ollama CLI: <code className="bg-muted px-1 rounded">ollama pull llama3</code>
            </p>
          </div>
        )}
      </div>
      
      {models.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Click on a model to select it for chat. These models run locally on your machine.
        </p>
      )}
    </div>
  );
}