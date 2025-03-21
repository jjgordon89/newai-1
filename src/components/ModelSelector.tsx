import React, { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  Cpu,
  Zap,
  Sparkles,
  BrainCircuit,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/context/ChatContext";
import { HuggingFaceModel } from "@/lib/api";

// List of supported models with additional metadata
const SUPPORTED_MODELS_DATA = [
  {
    id: "mistralai/Mistral-7B-Instruct-v0.2",
    name: "Mistral 7B",
    description: "Balanced performance with moderate resource usage",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 8192,
    strengths: ["Balanced", "General-purpose"],
    icon: Cpu,
  },
  {
    id: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    name: "Mixtral 8x7B",
    description: "Mixture of experts model with strong performance",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 32768,
    strengths: ["Powerful", "Multilingual"],
    icon: BrainCircuit,
  },
  {
    id: "mistralai/Mistral-Nemo-Instruct-2407",
    name: "Mistral Nemo",
    description: "Latest top-performing Mistral model with enhanced reasoning",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 32768,
    strengths: ["Advanced reasoning", "STEM expertise"],
    icon: BrainCircuit,
  },
  {
    id: "meta-llama/Llama-2-7b-chat-hf",
    name: "Llama 2 (7B)",
    description: "Meta's open source chat model with good reasoning",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 4096,
    strengths: ["Open-source", "Reasoning"],
    icon: BrainCircuit,
  },
  {
    id: "meta-llama/Llama-2-13b-chat-hf",
    name: "Llama 2 (13B)",
    description: "Larger version of Llama 2 with improved capabilities",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 4096,
    strengths: ["Reasoning", "Complex tasks"],
    icon: BrainCircuit,
  },
  {
    id: "meta-llama/Meta-Llama-3-8B-Instruct",
    name: "Llama 3 (8B)",
    description:
      "Meta's latest generation language model with improved performance",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 8192,
    strengths: ["Reasoning", "Efficient"],
    icon: BrainCircuit,
  },
  {
    id: "meta-llama/Meta-Llama-3-70B-Instruct",
    name: "Llama 3 (70B)",
    description: "Meta's large high-performance language model",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 8192,
    strengths: ["Complex reasoning", "High-performance"],
    icon: BrainCircuit,
  },
  {
    id: "microsoft/phi-2",
    name: "Phi-2",
    description: "Compact but capable model for basic tasks",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 2048,
    strengths: ["Compact", "Fast"],
    icon: Zap,
  },
  {
    id: "microsoft/Phi-3-mini-4k-instruct",
    name: "Phi-3 Mini",
    description: "Microsoft's latest compact and efficient language model",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 4096,
    strengths: ["Highly efficient", "Reasoning"],
    icon: Zap,
  },
  {
    id: "Qwen/Qwen1.5-7B-Chat",
    name: "Qwen 1.5 (7B)",
    description: "Versatile bilingual model with efficient processing",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 8192,
    strengths: ["Multilingual", "Efficient"],
    icon: Cpu,
  },
  {
    id: "Qwen/Qwen2-7B-Instruct",
    name: "Qwen 2 (7B)",
    description: "Alibaba's latest language model with improved performance",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 32768,
    strengths: ["Long context", "Multilingual"],
    icon: Cpu,
  },
  {
    id: "google/gemma-7b-it",
    name: "Gemma (7B)",
    description: "Google's lightweight language model",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 8192,
    strengths: ["Lightweight", "Instruction-tuned"],
    icon: Zap,
  },
  {
    id: "google/gemma-2-9b-it",
    name: "Gemma 2 (9B)",
    description: "Google's latest language model with enhanced capabilities",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 8192,
    strengths: ["Efficient", "High quality"],
    icon: Zap,
  },
  {
    id: "NousResearch/Nous-Hermes-2-Yi-34B",
    name: "Nous Hermes-2 (34B)",
    description: "Large high-performance instruction-tuned model",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 4096,
    strengths: ["High-performance", "Instruction-tuned"],
    icon: BrainCircuit,
  },
  {
    id: "codellama/CodeLlama-34b-Instruct-hf",
    name: "CodeLlama (34B)",
    description: "Large code-specialized model for development tasks",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 16384,
    strengths: ["Code generation", "Programming"],
    icon: BrainCircuit,
  },
  {
    id: "Salesforce/xgen-7b-8k-inst",
    name: "XGEN (7B)",
    description: "Salesforce's efficient instruction-tuned model",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 8192,
    strengths: ["Efficient", "Balanced"],
    icon: Cpu,
  },
  {
    id: "stabilityai/stablecode-instruct-alpha-3b",
    name: "StableCode (3B)",
    description: "Specialized model for code generation and completion",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 4096,
    strengths: ["Code-focused", "Compact"],
    icon: Zap,
  },
  {
    id: "databricks/dbrx-instruct",
    name: "DBRX",
    description: "Databricks' high-performance research model",
    category: "open-source",
    provider: "Hugging Face",
    contextLength: 32768,
    strengths: ["High-performance", "Data analysis"],
    icon: BrainCircuit,
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    description: "Anthropic's fastest and most compact model",
    category: "proprietary",
    provider: "Anthropic",
    contextLength: 200000,
    strengths: ["Fast", "Efficient"],
    icon: Zap,
    apiKeyRequired: true,
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    description: "Balanced performance and intelligence from Anthropic",
    category: "proprietary",
    provider: "Anthropic",
    contextLength: 200000,
    strengths: ["Balanced", "Nuanced"],
    icon: Sparkles,
    apiKeyRequired: true,
  },
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    description: "Anthropic's most powerful model for complex tasks",
    category: "proprietary",
    provider: "Anthropic",
    contextLength: 200000,
    strengths: ["Powerful", "Complex reasoning"],
    icon: BrainCircuit,
    apiKeyRequired: true,
  },
  {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "OpenAI's efficient general-purpose model",
    category: "proprietary",
    provider: "OpenAI",
    contextLength: 16385,
    strengths: ["Fast", "General-purpose"],
    icon: Zap,
    apiKeyRequired: true,
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "OpenAI's advanced general-purpose model",
    category: "proprietary",
    provider: "OpenAI",
    contextLength: 128000,
    strengths: ["Powerful", "Detailed"],
    icon: Sparkles,
    apiKeyRequired: true,
  },
  {
    id: "google/gemini-pro",
    name: "Gemini Pro",
    description: "Google's advanced reasoning model",
    category: "proprietary",
    provider: "Google",
    contextLength: 32768,
    strengths: ["Reasoning", "General knowledge"],
    icon: BrainCircuit,
    apiKeyRequired: true,
  },

  // Ollama Models - These are placeholders, actual models will be loaded dynamically
  {
    id: "ollama:llama3",
    name: "Llama 3 (Local)",
    description: "Meta's latest language model running locally via Ollama",
    category: "local",
    provider: "Ollama",
    contextLength: 8192,
    strengths: ["Local", "Privacy-focused"],
    icon: Server,
    apiKeyRequired: false,
  },
  {
    id: "ollama:mistral",
    name: "Mistral (Local)",
    description: "High-performance instruction-tuned model running locally",
    category: "local",
    provider: "Ollama",
    contextLength: 8192,
    strengths: ["Local", "Efficient"],
    icon: Server,
    apiKeyRequired: false,
  },
  {
    id: "ollama:mixtral",
    name: "Mixtral (Local)",
    description: "Mixture of experts model running locally via Ollama",
    category: "local",
    provider: "Ollama",
    contextLength: 32768,
    strengths: ["Local", "Powerful"],
    icon: Server,
    apiKeyRequired: false,
  },
  {
    id: "ollama:phi3",
    name: "Phi-3 (Local)",
    description: "Microsoft's compact model running locally via Ollama",
    category: "local",
    provider: "Ollama",
    contextLength: 4096,
    strengths: ["Local", "Compact"],
    icon: Server,
    apiKeyRequired: false,
  },
  {
    id: "ollama:codellama",
    name: "CodeLlama (Local)",
    description: "Code-optimized model running locally via Ollama",
    category: "local",
    provider: "Ollama",
    contextLength: 16384,
    strengths: ["Local", "Code-focused"],
    icon: Server,
    apiKeyRequired: false,
  },
];

// Define type for model data
type SupportedModel = (typeof SUPPORTED_MODELS)[0];

export type ModelSelectorProps = {
  className?: string;
  isCompact?: boolean;
  onlyAvailable?: boolean;
  onChange?: (modelId: string) => void;
};

// Export models as part of the component export
export const SUPPORTED_MODELS = SUPPORTED_MODELS_DATA;

export function ModelSelector({
  className,
  isCompact = false,
  onlyAvailable = false,
  onChange,
}: ModelSelectorProps) {
  const { activeModel, setActiveModel, availableApiKeys } = useChat();
  const [open, setOpen] = useState(false);

  // Filter models based on available API keys if onlyAvailable is true
  const filteredModels = onlyAvailable
    ? SUPPORTED_MODELS.filter(
        (model) =>
          !model.apiKeyRequired ||
          (model.apiKeyRequired &&
            availableApiKeys[model.provider.toLowerCase()]),
      )
    : SUPPORTED_MODELS;

  const activeModelData =
    SUPPORTED_MODELS.find((m) => m.id === activeModel.id) ||
    SUPPORTED_MODELS[0];
  const Icon = activeModelData.icon || Cpu;

  const handleSelectModel = (modelId: string) => {
    const selectedModel = SUPPORTED_MODELS.find((m) => m.id === modelId);
    if (selectedModel) {
      if (onChange) {
        // If onChange prop is provided, call it instead of directly setting the model
        onChange(modelId);
      } else {
        // Otherwise use the default behavior
        setActiveModel({
          id: selectedModel.id,
          name: selectedModel.name,
          description: selectedModel.description,
          task: "text-generation",
        });
      }
    }
    setOpen(false);
  };

  // Compact view (for chat header)
  if (isCompact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 border-dashed"
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="truncate max-w-[100px]">
              {activeModelData.name}
            </span>
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[225px] p-0" align="end">
          <Command>
            <CommandList>
              <CommandGroup heading="AI Models">
                {filteredModels.map((model) => {
                  const ModelIcon = model.icon || Cpu;
                  return (
                    <CommandItem
                      key={model.id}
                      onSelect={() => handleSelectModel(model.id)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 h-4 w-4 flex items-center justify-center",
                          model.id === activeModel.id
                            ? "opacity-100"
                            : "opacity-40",
                        )}
                      >
                        <ModelIcon className="h-4 w-4" />
                      </div>
                      <span>{model.name}</span>
                      {model.id === activeModel.id && (
                        <Check className="ml-auto h-4 w-4 opacity-100" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Full view (for settings)
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full"
          >
            <div className="flex items-center gap-2 truncate">
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{activeModelData.name}</span>
              {activeModelData.apiKeyRequired &&
                !availableApiKeys[activeModelData.provider.toLowerCase()] && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-amber-500 border-amber-500"
                  >
                    API Key Required
                  </Badge>
                )}
            </div>
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList className="max-h-[300px] overflow-auto">
              <CommandEmpty>No models found.</CommandEmpty>
              <CommandGroup heading="Hugging Face Models">
                {filteredModels
                  .filter((model) => model.provider === "Hugging Face")
                  .map((model) => (
                    <ModelCommandItem
                      key={model.id}
                      model={model}
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="OpenAI Models">
                {filteredModels
                  .filter((model) => model.provider === "OpenAI")
                  .map((model) => (
                    <ModelCommandItem
                      key={model.id}
                      model={model}
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="Anthropic Models">
                {filteredModels
                  .filter((model) => model.provider === "Anthropic")
                  .map((model) => (
                    <ModelCommandItem
                      key={model.id}
                      model={model}
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="Google Models">
                {filteredModels
                  .filter((model) => model.provider === "Google")
                  .map((model) => (
                    <ModelCommandItem
                      key={model.id}
                      model={model}
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="Ollama Models">
                {filteredModels
                  .filter((model) => model.provider === "Ollama")
                  .map((model) => (
                    <ModelCommandItem
                      key={model.id}
                      model={model}
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

type ModelCommandItemProps = {
  model: SupportedModel;
  activeModelId: string;
  onSelect: (id: string) => void;
  availableApiKeys: Record<string, boolean>;
};

function ModelCommandItem({
  model,
  activeModelId,
  onSelect,
  availableApiKeys,
}: ModelCommandItemProps) {
  const ModelIcon = model.icon || Cpu;
  const isActive = model.id === activeModelId;
  const isAvailable =
    !model.apiKeyRequired ||
    (model.apiKeyRequired && availableApiKeys[model.provider.toLowerCase()]);

  return (
    <CommandItem
      key={model.id}
      onSelect={() => onSelect(model.id)}
      className={cn(
        "flex items-start py-2 cursor-pointer",
        !isAvailable && "opacity-60",
      )}
      disabled={!isAvailable}
    >
      <div className="flex flex-1 gap-2">
        <div
          className={cn(
            "mt-0.5 h-5 w-5 flex-shrink-0",
            isActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          <ModelIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{model.name}</span>
            {model.category === "open-source" && (
              <Badge variant="outline" className="px-1 text-xs h-5">
                Open-source
              </Badge>
            )}
            {model.apiKeyRequired &&
              !availableApiKeys[model.provider.toLowerCase()] && (
                <Badge
                  variant="outline"
                  className="px-1 h-5 text-xs text-amber-500 border-amber-500"
                >
                  API Key Required
                </Badge>
              )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {model.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {model.strengths.map((strength, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-1 py-0 text-xs"
              >
                {strength}
              </Badge>
            ))}
            <Badge variant="secondary" className="px-1 py-0 text-xs">
              {model.contextLength.toLocaleString()} tokens
            </Badge>
            <Badge variant="secondary" className="px-1 py-0 text-xs">
              {model.provider}
            </Badge>
          </div>
        </div>
      </div>
      {isActive && (
        <Check className="ml-2 h-4 w-4 flex-shrink-0 text-primary" />
      )}
    </CommandItem>
  );
}
