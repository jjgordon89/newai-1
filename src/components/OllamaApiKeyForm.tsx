import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Server } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getOllamaEndpoint, saveOllamaEndpoint, checkOllamaStatus } from '@/lib/ollamaService';

export function OllamaApiKeyForm() {
  const [endpoint, setEndpoint] = useState<string>(getOllamaEndpoint());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const status = await checkOllamaStatus(endpoint);
      setIsConnected(status);
      if (!status) {
        setError('Could not connect to Ollama server. Make sure Ollama is running and the endpoint is correct.');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Connection failed. Make sure Ollama is running and the endpoint is correct.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = () => {
    saveOllamaEndpoint(endpoint);
    checkConnection();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Ollama Configuration
        </CardTitle>
        <CardDescription>
          Configure your Ollama server endpoint. Ollama provides local AI capabilities by running models on your own hardware.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ollama-endpoint">Ollama API Endpoint</Label>
          <div className="flex gap-2">
            <Input
              id="ollama-endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="http://localhost:11434/api"
              className="flex-1"
            />
            <Button 
              onClick={handleSave}
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : 'Save & Check'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The default endpoint for local Ollama installation is: http://localhost:11434/api
          </p>
        </div>

        {isConnected ? (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Connected to Ollama successfully. You can now use local Ollama models.
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="text-sm space-y-2 mt-4">
          <h4 className="font-medium">Using Ollama</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Download and install Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ollama.ai</a></li>
            <li>Run the Ollama application on your computer</li>
            <li>Pull models using the Ollama command: <code className="bg-muted px-1 rounded">ollama pull modelname</code></li>
            <li>Connect to your Ollama instance with the endpoint URL above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}