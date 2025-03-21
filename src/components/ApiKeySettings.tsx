import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useChat } from "@/context/ChatContext";
import {
  AlertTriangle,
  CheckCircle,
  Key,
  Lock,
  AlarmClock,
  Sparkles,
  BrainCircuit,
  Globe,
  RefreshCw,
  Server,
  Settings,
} from "lucide-react";
import { SUPPORTED_MODELS } from "@/components/ModelSelector";
import { ApiProvider } from "@/context/ChatContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OllamaApiKeyForm } from "@/components/OllamaApiKeyForm";
import { OllamaModels } from "@/components/OllamaModels";
import { OpenRouterApiKeyForm } from "@/components/OpenRouterApiKeyForm";
import { OpenRouterModels } from "@/components/OpenRouterModels";
import { ModelSettings } from "@/components/ModelSettings";
import { Workspace } from "@/context/WorkspaceContext";
import MistralApiKeyForm from "@/components/MistralApiKeyForm";
import HuggingFaceApiKeyForm from "@/components/HuggingFaceApiKeyForm";
import OpenAIApiKeyForm from "@/components/OpenAIApiKeyForm";
import AnthropicApiKeyForm from "@/components/AnthropicApiKeyForm";
import { GoogleApiKeyForm } from "@/components/GoogleApiKeyForm";

interface ApiProviderInfo {
  id: ApiProvider;
  name: string;
  description: string;
  website: string;
  icon: React.ElementType;
  requiresKey: boolean;
  getKeyLink: string;
  freeCredits?: string;
  contextWindow?: string;
  pricingInfo?: string;
}

interface ApiKeySettingsProps {
  workspace?: Workspace;
  onUpdateKeys?: (provider: string, key: string) => void;
}

const API_PROVIDERS: ApiProviderInfo[] = [
  {
    id: "hugging face",
    name: "Hugging Face",
    description: "Open-source AI models through the Hugging Face Inference API",
    website: "https://huggingface.co",
    icon: BrainCircuit,
    requiresKey: true,
    getKeyLink: "https://huggingface.co/settings/tokens",
    freeCredits: "Limited free tier available",
    pricingInfo: "Pay-as-you-go available for higher usage",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Advanced AI models including GPT-3.5 and GPT-4",
    website: "https://openai.com",
    icon: Sparkles,
    requiresKey: true,
    getKeyLink: "https://platform.openai.com/api-keys",
    freeCredits: "$5 free credit for new users",
    contextWindow: "Up to 128K tokens with GPT-4 Turbo",
    pricingInfo: "Pay-as-you-go based on tokens processed",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Powerful Claude AI models with extensive context windows",
    website: "https://anthropic.com",
    icon: AlarmClock,
    requiresKey: true,
    getKeyLink: "https://console.anthropic.com/settings/keys",
    contextWindow: "Up to 200K tokens with Claude 3",
    pricingInfo: "Pay-as-you-go based on tokens processed",
  },
  {
    id: "google",
    name: "Google AI",
    description: "Google's Gemini models for advanced reasoning",
    website: "https://ai.google.dev/",
    icon: Globe,
    requiresKey: true,
    getKeyLink: "https://aistudio.google.com/app/apikey",
    pricingInfo: "Free and paid tiers available",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Unified API for 100+ AI models from different providers",
    website: "https://openrouter.ai",
    icon: Server,
    requiresKey: true,
    getKeyLink: "https://openrouter.ai/keys",
    pricingInfo: "Pay-as-you-go with transparent pricing",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Powerful open-source and proprietary AI models",
    website: "https://mistral.ai",
    icon: BrainCircuit,
    requiresKey: true,
    getKeyLink: "https://console.mistral.ai/api-keys/",
    pricingInfo: "Free tier available with paid options for higher usage",
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Local AI models running on your own hardware",
    website: "https://ollama.ai",
    icon: BrainCircuit,
    requiresKey: false,
    getKeyLink: "",
    pricingInfo: "Free - runs locally",
  },
];

export function ApiKeySettings({
  workspace,
  onUpdateKeys,
}: ApiKeySettingsProps) {
  const { availableApiKeys, setApiKey, getApiKey } = useChat();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    // Initialize from workspace settings if provided, otherwise from global settings
    if (workspace?.settings?.apiKeys) {
      return { ...workspace.settings.apiKeys };
    }
    return API_PROVIDERS.reduce((acc, provider) => {
      const key = getApiKey(provider.id as ApiProvider) || "";
      return { ...acc, [provider.id]: key };
    }, {});
  });

  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("hugging face");

  // Update the apiKeys state if the workspace changes
  useEffect(() => {
    if (workspace?.settings?.apiKeys) {
      setApiKeys((prev) => ({
        ...prev,
        ...workspace.settings?.apiKeys,
      }));
    }
  }, [workspace]);

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const handleToggleVisibility = (provider: string) => {
    setIsVisible((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSaveKey = async (provider: ApiProvider) => {
    setIsSubmitting((prev) => ({ ...prev, [provider]: true }));

    try {
      if (onUpdateKeys) {
        // Save to workspace settings
        onUpdateKeys(provider, apiKeys[provider]);
      } else {
        // Save to global settings
        setApiKey(apiKeys[provider], provider);
      }
      setIsSubmitting((prev) => ({ ...prev, [provider]: false }));
      return true;
    } catch (error) {
      console.error(`Error saving ${provider} API key:`, error);
      setIsSubmitting((prev) => ({ ...prev, [provider]: false }));
      return false;
    }
  };

  // Check if API key is available (either in workspace settings or global settings)
  const isKeyAvailable = (provider: string): boolean => {
    if (workspace?.settings?.apiKeys && workspace.settings.apiKeys[provider]) {
      return true;
    }
    return !!availableApiKeys[provider];
  };

  const getProviderModels = (provider: string) => {
    return SUPPORTED_MODELS.filter(
      (model) => model.provider.toLowerCase() === provider.toLowerCase(),
    );
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          AI Model Providers
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure API keys for different AI providers to access their models
        </p>
      </div>

      {/* Model Settings Section */}
      <ModelSettings />

      <div className="my-8 border-t pt-6">
        <h3 className="text-xl font-semibold tracking-tight mb-4">API Keys</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="model-settings" className="relative">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </div>
          </TabsTrigger>
          {API_PROVIDERS.map((provider) => (
            <TabsTrigger
              key={provider.id}
              value={provider.id}
              className="relative"
            >
              <div className="flex items-center gap-2">
                <provider.icon className="h-4 w-4" />
                <span>{provider.name}</span>
              </div>
              {isKeyAvailable(provider.id) && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="model-settings" className="space-y-4 mt-4">
          <ModelSettings />
        </TabsContent>

        {API_PROVIDERS.map((provider) => (
          <TabsContent
            key={provider.id}
            value={provider.id}
            className="space-y-4 mt-4"
          >
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{provider.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {provider.description}
                  </p>
                </div>
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Visit website
                </a>
              </div>

              {provider.id === "hugging face" ? (
                // Special case for Hugging Face with its own form
                <HuggingFaceApiKeyForm />
              ) : provider.id === "openai" ? (
                // Special case for OpenAI with its own form
                <OpenAIApiKeyForm />
              ) : provider.id === "anthropic" ? (
                // Special case for Anthropic with its own form
                <AnthropicApiKeyForm />
              ) : provider.id === "google" ? (
                // Special case for Google AI with its own form
                <GoogleApiKeyForm />
              ) : provider.id === "ollama" ? (
                // Special case for Ollama with its own form
                <OllamaApiKeyForm />
              ) : provider.id === "mistral" ? (
                // Special case for Mistral with its own form
                <MistralApiKeyForm />
              ) : provider.id === "openrouter" ? (
                // Special case for OpenRouter with its own form
                <OpenRouterApiKeyForm />
              ) : provider.requiresKey ? (
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-api-key`}>API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`${provider.id}-api-key`}
                          type={isVisible[provider.id] ? "text" : "password"}
                          value={apiKeys[provider.id] || ""}
                          onChange={(e) =>
                            handleKeyChange(provider.id, e.target.value)
                          }
                          placeholder={`Enter your ${provider.name} API key`}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => handleToggleVisibility(provider.id)}
                        >
                          <Lock className="h-4 w-4" />
                          <span className="sr-only">Toggle visibility</span>
                        </Button>
                      </div>
                      <Button
                        onClick={() =>
                          handleSaveKey(provider.id as ApiProvider)
                        }
                        disabled={
                          isSubmitting[provider.id] || !apiKeys[provider.id]
                        }
                      >
                        {isSubmitting[provider.id] ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Key className="h-4 w-4 mr-2" />
                        )}
                        Save Key
                      </Button>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <a
                        href={provider.getKeyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Get an API key
                      </a>
                      {isKeyAvailable(provider.id) ? (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          <span>API key configured</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-500">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                          <span>No API key set</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isKeyAvailable(provider.id) && (
                    <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>API Key Required</AlertTitle>
                      <AlertDescription>
                        An API key is required to use {provider.name} models.
                        {provider.freeCredits && (
                          <span className="font-medium block mt-1">
                            {provider.freeCredits}
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert className="bg-blue-50 text-blue-800 border-blue-200 mt-2">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>No API Key Required</AlertTitle>
                  <AlertDescription>
                    {provider.name} does not require an API key.{" "}
                    {provider.pricingInfo}
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-4 pt-4 border-t">
                {provider.id === "ollama" ? (
                  // Show Ollama models component
                  <OllamaModels />
                ) : provider.id === "openrouter" ? (
                  // Show OpenRouter models component with callback to integrate models
                  <OpenRouterModels
                    onModelSelect={(modelId) => {
                      // This component provides the list of all available models
                      // We can use this as a hook point to load models into the application
                      console.log("Selected OpenRouter model ID:", modelId);

                      // The actual model loading happens inside the OpenRouterModels component
                      // which uses listOpenRouterModels and addOpenRouterModels
                    }}
                  />
                ) : (
                  <>
                    <h4 className="font-medium mb-2">Available Models</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getProviderModels(provider.id).map((model) => (
                        <div
                          key={model.id}
                          className={`border rounded-md p-3
                            ${
                              !isKeyAvailable(provider.id) &&
                              provider.requiresKey
                                ? "opacity-50"
                                : "hover:border-primary"
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <model.icon className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                              <h5 className="font-medium">{model.name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {model.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {model.strengths &&
                                  model.strengths.map((strength, index) => (
                                    <span
                                      key={index}
                                      className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                                    >
                                      {strength}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
