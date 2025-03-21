import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  AlertCircle,
  Key,
  Plus,
  Trash,
  Check,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiProvider } from "@/lib/apiKeyManager";

// Define supported services
const supportedServices = [
  {
    id: "openai",
    name: "OpenAI",
    description: "For GPT models and embeddings",
  },
  { id: "anthropic", name: "Anthropic", description: "For Claude models" },
  {
    id: "google",
    name: "Google AI",
    description: "For Gemini models and Google services",
  },
  { id: "mistral", name: "Mistral AI", description: "For Mistral models" },
  {
    id: "hugging face",
    name: "Hugging Face",
    description: "For open-source models and embeddings",
  },
  { id: "ollama", name: "Ollama", description: "For local models" },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "For accessing multiple models",
  },
  { id: "serp", name: "SERP API", description: "For web search capabilities" },
  {
    id: "brave",
    name: "Brave Search",
    description: "For web search capabilities",
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    description: "For web search capabilities",
  },
  {
    id: "weather",
    name: "Weather API",
    description: "For weather information",
  },
];

interface ApiKey {
  id: string;
  userId: string;
  service: string;
  createdAt: number;
  updatedAt: number;
  lastUsed?: number;
}

export default function ApiKeySettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New API key form state
  const [selectedService, setSelectedService] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load API keys on component mount
  useEffect(() => {
    loadApiKeys();
  }, []);

  // Load API keys from the server
  const loadApiKeys = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/api-keys");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load API keys");
      }

      setApiKeys(data.apiKeys || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while loading API keys",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save a new API key
  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!selectedService || !apiKeyValue) {
        throw new Error("Service and API key are required");
      }

      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ service: selectedService, apiKey: apiKeyValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save API key");
      }

      // Reset form
      setSelectedService("");
      setApiKeyValue("");
      setSuccess("API key saved successfully");

      // Reload API keys
      await loadApiKeys();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving the API key",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an API key
  const handleDeleteApiKey = async (service: string) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/api-keys?service=${encodeURIComponent(service)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete API key");
      }

      setSuccess("API key deleted successfully");

      // Reload API keys
      await loadApiKeys();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while deleting the API key",
      );
    }
  };

  // Get service name from ID
  const getServiceName = (serviceId: string) => {
    const service = supportedServices.find((s) => s.id === serviceId);
    return service ? service.name : serviceId;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for various services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Current API Keys */}
            <div>
              <h3 className="text-lg font-medium mb-4">Your API Keys</h3>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No API keys found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first API key below
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">
                          {getServiceName(key.service)}
                        </TableCell>
                        <TableCell>{formatDate(key.createdAt)}</TableCell>
                        <TableCell>
                          {key.lastUsed ? formatDate(key.lastUsed) : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteApiKey(key.service)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Add New API Key */}
            <div>
              <h3 className="text-lg font-medium mb-4">Add New API Key</h3>

              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select
                      value={selectedService}
                      onValueChange={setSelectedService}
                    >
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center">
                              <span>{service.name}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{service.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKeyValue}
                      onChange={(e) => setApiKeyValue(e.target.value)}
                      placeholder="Enter your API key"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedService || !apiKeyValue}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add API Key
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
