import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getApiKey,
  setApiKey,
  Message,
  queryModel,
  searchSimilarDocuments,
  AVAILABLE_MODELS,
  HuggingFaceModel,
  EMBEDDING_MODELS,
  getCurrentEmbeddingModel,
  DocumentType,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  searchWeb,
  formatSearchResultsAsContext,
} from "@/lib/webSearchService";
import {
  availableSkills,
  detectSkill,
  executeSkill,
  Skill,
} from "@/lib/skillsService";
import { WeatherData } from "@/lib/weatherService";
import { useWorkspace } from "./WorkspaceContext";
import { RagSystem } from "@/lib/ragSystem";

// Define skill result type
type SkillResult = {
  skillId: string;
  data: any;
};

// Extend the Message type to support threading
type ThreadedMessage = Message & {
  threadId?: string; // ID of the thread this message belongs to
  parentId?: string; // ID of the parent message in a thread
  hasThread?: boolean; // Whether this message has a thread
  skillResult?: SkillResult; // Add this property for skill results
  workspaceId?: string; // ID of the workspace this message belongs to
};

// Define chat type to include workspace ID
type Chat = {
  id: string;
  title: string;
  messages: ThreadedMessage[];
  workspaceId: string; // Associated workspace ID
};

// Define RAG settings type
export type RagSettings = {
  topK: number;
  similarityThreshold: number;
  enhancedContext: boolean;
  searchResultsCount: number;
  searchTimeRange: "day" | "week" | "month" | "year";
  autoCitation: boolean;
  // Advanced RAG settings
  chunkingStrategy?: "hybrid" | "fixed" | "semantic";
  retrieverStrategy?: "hybrid" | "vector" | "keyword";
  rerankerModel?: string;
  queryRouting?: "hybrid" | "direct" | "decomposed";
  useQueryExpansion?: boolean;
  includeMetadata?: boolean;
  enableQueryDecomposition?: boolean;
  hybridSearchWeights?: { vector: number; keyword: number };
};

// API Provider types
export type ApiProvider =
  | "hugging face"
  | "openai"
  | "anthropic"
  | "google"
  | "ollama"
  | "openrouter"
  | "custom";

// Define the context type
type ChatContextType = {
  messages: ThreadedMessage[];
  isLoading: boolean;
  activeChatId: string | null;
  activeThreadId: string | null;
  chats: Chat[];
  activeModel: HuggingFaceModel;
  availableModels: HuggingFaceModel[];
  isApiKeySet: boolean;
  ragEnabled: boolean;
  webSearchEnabled: boolean;
  ragSettings: RagSettings;
  skillsEnabled: boolean;
  setSkillsEnabled: (enabled: boolean) => void;
  availableSkills: Skill[];
  setRagEnabled: (enabled: boolean) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  updateRagSettings: (settings: Partial<RagSettings>) => void;
  sendMessage: (content: string, parentId?: string) => Promise<void>;
  startThread: (messageId: string) => void;
  exitThread: () => void;
  startNewChat: () => void;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearChats: () => void;
  clearAllChats: () => void; // New function to clear all chats across all workspaces
  setApiKey: (key: string, provider?: ApiProvider) => boolean;
  getApiKey: (provider: ApiProvider) => string | null;
  availableApiKeys: Record<string, boolean>; // Track which API providers have keys set
  setActiveModel: (model: HuggingFaceModel) => void;
};

// Default RAG settings
const DEFAULT_RAG_SETTINGS: RagSettings = {
  topK: 3,
  similarityThreshold: 70,
  enhancedContext: false,
  searchResultsCount: 3,
  searchTimeRange: "month",
  autoCitation: true,
};

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Create a provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<HuggingFaceModel>(
    AVAILABLE_MODELS[0],
  );
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    // Initialize from localStorage
    const savedKeys = localStorage.getItem("api_keys");
    return savedKeys ? JSON.parse(savedKeys) : {};
  });

  const [availableApiKeys, setAvailableApiKeys] = useState<
    Record<string, boolean>
  >(() => {
    const savedKeys = localStorage.getItem("api_keys");
    if (!savedKeys) return {};

    const keys = JSON.parse(savedKeys);
    return Object.keys(keys).reduce(
      (acc, provider) => ({
        ...acc,
        [provider]: !!keys[provider],
      }),
      {},
    );
  });

  const isApiKeySet = true; // Default to true since API keys are now optional
  const [ragEnabled, setRagEnabled] = useState<boolean>(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  const [ragSettings, setRagSettings] =
    useState<RagSettings>(DEFAULT_RAG_SETTINGS);
  const [skillsEnabled, setSkillsEnabled] = useState<boolean>(true);

  const { toast } = useToast();
  const { activeWorkspaceId } = useWorkspace();

  // Effect to initialize from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem("chats");
    const savedActiveChatId = localStorage.getItem("activeChatId");
    const savedActiveThreadId = localStorage.getItem("activeThreadId");
    const savedActiveModelId = localStorage.getItem("activeModelId");
    const savedPreferredModelId = localStorage.getItem("preferredModelId");
    const savedRagEnabled = localStorage.getItem("ragEnabled");
    const savedWebSearchEnabled = localStorage.getItem("webSearchEnabled");
    const savedRagSettings = localStorage.getItem("ragSettings");
    const savedSkillsEnabled = localStorage.getItem("skillsEnabled");

    if (savedChats) {
      try {
        // Make sure each chat has a valid workspaceId to prevent orphaned chats
        const parsedChats = JSON.parse(savedChats);
        const validChats = parsedChats.filter((chat) => chat.workspaceId);
        setChats(validChats);
      } catch (e) {
        console.error("Failed to parse saved chats:", e);
      }
    }

    if (savedActiveChatId) {
      setActiveChatId(savedActiveChatId);
    }

    if (savedActiveThreadId) {
      setActiveThreadId(savedActiveThreadId);
    }

    // First check for preferred model (explicitly saved by user)
    if (savedPreferredModelId) {
      const preferredModel = AVAILABLE_MODELS.find(
        (m) => m.id === savedPreferredModelId,
      );
      if (preferredModel) setActiveModel(preferredModel);
    }
    // Fall back to last active model if no preference is set
    else if (savedActiveModelId) {
      const model = AVAILABLE_MODELS.find((m) => m.id === savedActiveModelId);
      if (model) setActiveModel(model);
    }

    if (savedRagEnabled) {
      setRagEnabled(savedRagEnabled === "true");
    }

    if (savedWebSearchEnabled) {
      setWebSearchEnabled(savedWebSearchEnabled === "true");
    }

    if (savedRagSettings) {
      try {
        setRagSettings({
          ...DEFAULT_RAG_SETTINGS,
          ...JSON.parse(savedRagSettings),
        });
      } catch (e) {
        console.error("Failed to parse saved RAG settings:", e);
      }
    }

    if (savedSkillsEnabled) {
      setSkillsEnabled(savedSkillsEnabled === "true");
    }
  }, []);

  // Update RAG system when settings change
  useEffect(() => {
    // Update RAG system with current settings, ensuring types match
    RagSystem.updateSettings({
      chunkingStrategy:
        (ragSettings.chunkingStrategy as
          | "hybrid"
          | "semantic"
          | "fixedSize"
          | "recursive") || "hybrid",
      retrieverStrategy:
        (ragSettings.retrieverStrategy as
          | "hybrid"
          | "semantic"
          | "mmr"
          | "reranking") || "hybrid",
      rerankerModel:
        (ragSettings.rerankerModel as
          | "reciprocal-rank-fusion"
          | "none"
          | "simple"
          | "cross-attention") || "reciprocal-rank-fusion",
      queryRouting:
        (ragSettings.queryRouting as
          | "hybrid"
          | "semantic"
          | "keyword"
          | "basic") || "hybrid",
      topK: ragSettings.topK || 3,
      similarityThreshold: ragSettings.similarityThreshold || 70,
      useQueryExpansion: ragSettings.useQueryExpansion !== false,
      includeMetadata: ragSettings.includeMetadata !== false,
      enableQueryDecomposition: ragSettings.enableQueryDecomposition === true,
      hybridSearchWeights: ragSettings.hybridSearchWeights || {
        vector: 0.7,
        keyword: 0.3,
      },
    });
  }, [ragSettings]);

  // Effect to save to localStorage when state changes
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats));
    }

    if (activeChatId) {
      localStorage.setItem("activeChatId", activeChatId);
    }

    if (activeThreadId) {
      localStorage.setItem("activeThreadId", activeThreadId);
    } else {
      localStorage.removeItem("activeThreadId");
    }

    localStorage.setItem("activeModelId", activeModel.id);
    localStorage.setItem("ragEnabled", ragEnabled.toString());
    localStorage.setItem("webSearchEnabled", webSearchEnabled.toString());
    localStorage.setItem("ragSettings", JSON.stringify(ragSettings));
    localStorage.setItem("skillsEnabled", skillsEnabled.toString());
  }, [
    chats,
    activeChatId,
    activeThreadId,
    activeModel.id,
    ragEnabled,
    webSearchEnabled,
    ragSettings,
    skillsEnabled,
  ]);

  // Update RAG settings
  const updateRagSettings = useCallback((settings: Partial<RagSettings>) => {
    setRagSettings((prev) => ({
      ...prev,
      ...settings,
    }));
  }, []);

  // Get the active chat's messages, filtered by workspace
  const messages = activeChatId
    ? chats
        .find(
          (chat) =>
            chat.id === activeChatId &&
            (!activeWorkspaceId || chat.workspaceId === activeWorkspaceId),
        )
        ?.messages.filter((msg) => {
          if (activeThreadId) {
            // When viewing a thread, show only messages in this thread
            return msg.threadId === activeThreadId || msg.id === activeThreadId;
          } else {
            // In main view, show only messages without a thread ID (main conversation)
            return !msg.threadId;
          }
        }) || []
    : [];

  // Start a new chat
  const startNewChat = useCallback(() => {
    if (!activeWorkspaceId) return;

    const systemMessage: ThreadedMessage = {
      id: uuidv4(),
      role: "system",
      content:
        "You are a helpful, friendly, and knowledgeable AI assistant. Answer questions accurately and helpfully.",
      timestamp: new Date(),
      workspaceId: activeWorkspaceId,
    };

    const newChatId = uuidv4();
    const newChat: Chat = {
      id: newChatId,
      title: "New Chat",
      messages: [systemMessage],
      workspaceId: activeWorkspaceId,
    };

    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChatId);
    setActiveThreadId(null);
  }, [activeWorkspaceId]);

  // Start a thread from a message
  const startThread = useCallback(
    (messageId: string) => {
      setActiveThreadId(messageId);

      // Mark the parent message as having a thread
      setChats((prev) => {
        const updatedChats = prev.map((chat) => {
          if (chat.id === activeChatId) {
            const updatedMessages = chat.messages.map((msg) => {
              if (msg.id === messageId) {
                return { ...msg, hasThread: true };
              }
              return msg;
            });
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        });
        return updatedChats;
      });
    },
    [activeChatId],
  );

  // Exit the current thread
  const exitThread = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  // Initialize chats for workspace
  useEffect(() => {
    console.log("Checking for chats initialization", {
      activeWorkspaceId,
      chatsLength: chats.length,
    });

    if (activeWorkspaceId) {
      // Get chats for this workspace
      const workspaceChats = chats.filter(
        (chat) => chat.workspaceId === activeWorkspaceId,
      );
      console.log("Workspace chats:", workspaceChats.length);

      if (workspaceChats.length === 0) {
        console.log("No chats for workspace, creating new chat");
        // Create a system message
        const systemMessage: ThreadedMessage = {
          id: uuidv4(),
          role: "system",
          content:
            "You are a helpful, friendly, and knowledgeable AI assistant. Answer questions accurately and helpfully.",
          timestamp: new Date(),
          workspaceId: activeWorkspaceId,
        };

        // Create a new chat
        const newChatId = uuidv4();
        const newChat: Chat = {
          id: newChatId,
          title: "New Chat",
          messages: [systemMessage],
          workspaceId: activeWorkspaceId,
        };

        // Add the new chat
        setChats((prev) => [...prev, newChat]);
        setActiveChatId(newChatId);
        setActiveThreadId(null);

        // Force save to localStorage
        localStorage.setItem("chats", JSON.stringify([...chats, newChat]));
        localStorage.setItem("activeChatId", newChatId);

        console.log("Created new chat:", newChatId);
      } else if (
        !activeChatId ||
        !workspaceChats.some((chat) => chat.id === activeChatId)
      ) {
        // If no active chat or active chat not in this workspace, set to first available
        console.log("Setting active chat to first available in workspace");
        setActiveChatId(workspaceChats[0].id);
        setActiveThreadId(null);
        localStorage.setItem("activeChatId", workspaceChats[0].id);
      }
    }
  }, [chats, activeChatId, activeWorkspaceId]);

  // Switch to a different chat
  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setActiveThreadId(null);
  }, []);

  // Delete a chat
  const deleteChat = useCallback(
    (chatId: string) => {
      if (!activeWorkspaceId) return false;

      // Filter chats by active workspace before deciding what to do
      const workspaceChats = chats.filter(
        (chat) => chat.workspaceId === activeWorkspaceId,
      );

      // Don't allow deleting if it's the only chat in the workspace
      if (workspaceChats.length <= 1) {
        toast({
          title: "Cannot Delete",
          description: "You must have at least one chat in each workspace",
          variant: "destructive",
        });
        return false;
      }

      setChats((prev) => prev.filter((chat) => chat.id !== chatId));

      // If deleted the active chat, switch to first available in the workspace
      if (activeChatId === chatId) {
        const remainingWorkspaceChats = workspaceChats.filter(
          (chat) => chat.id !== chatId,
        );
        if (remainingWorkspaceChats.length > 0) {
          setActiveChatId(remainingWorkspaceChats[0].id);
        }
        setActiveThreadId(null);
      }

      return true;
    },
    [activeChatId, chats, activeWorkspaceId, toast],
  );

  // Clear all chats for the current workspace
  const clearChats = useCallback(() => {
    if (!activeWorkspaceId) return;

    // Filter out chats from the current workspace
    setChats((prev) => {
      const filteredChats = prev.filter(
        (chat) => chat.workspaceId !== activeWorkspaceId,
      );
      return filteredChats;
    });

    setActiveChatId(null);
    setActiveThreadId(null);

    // Create a new chat for the workspace
    startNewChat();
  }, [activeWorkspaceId, startNewChat]);

  // Clear all chats across all workspaces
  const clearAllChats = useCallback(() => {
    // Remove all chats from state
    setChats([]);

    // Remove chats from localStorage
    localStorage.removeItem("chats");
    localStorage.removeItem("activeChatId");
    localStorage.removeItem("activeThreadId");

    // Reset state
    setActiveChatId(null);
    setActiveThreadId(null);

    toast({
      title: "All Chats Cleared",
      description: "All conversations have been removed from all workspaces",
    });

    // Force localStorage update by setting chats to empty array
    localStorage.setItem("chats", JSON.stringify([]));

    // Only create a new chat if there's an active workspace
    if (activeWorkspaceId) {
      startNewChat();
    }
  }, [activeWorkspaceId, startNewChat, toast]);

  // Get API key for a specific provider
  const getApiKey = useCallback(
    (provider: ApiProvider): string | null => {
      return apiKeys[provider.toLowerCase()] || null;
    },
    [apiKeys],
  );

  // Set API key for a specific provider
  const setApiKey = useCallback(
    (key: string, provider: ApiProvider = "hugging face") => {
      try {
        const normalizedProvider = provider.toLowerCase();

        if (key) {
          // Save the API key
          setApiKeys((prev) => ({
            ...prev,
            [normalizedProvider]: key,
          }));

          // Update available keys
          setAvailableApiKeys((prev) => ({
            ...prev,
            [normalizedProvider]: true,
          }));

          // Save to localStorage
          const updatedKeys = {
            ...apiKeys,
            [normalizedProvider]: key,
          };
          localStorage.setItem("api_keys", JSON.stringify(updatedKeys));

          // If it's the Hugging Face key, also update the legacy storage
          if (normalizedProvider === "hugging face") {
            setApiKey(key);
          }

          toast({
            title: "API Key Saved",
            description: `${provider} API key has been saved successfully`,
          });
        } else {
          // Remove the API key
          const { [normalizedProvider]: removed, ...remainingKeys } = apiKeys;
          setApiKeys(remainingKeys);

          setAvailableApiKeys((prev) => ({
            ...prev,
            [normalizedProvider]: false,
          }));

          localStorage.setItem("api_keys", JSON.stringify(remainingKeys));

          if (normalizedProvider === "hugging face") {
            localStorage.removeItem("hf_api_key");
          }

          toast({
            title: "API Key Removed",
            description: `${provider} API key has been removed`,
          });
        }

        return true;
      } catch (error) {
        console.error("Error setting API key:", error);
        toast({
          title: "Error",
          description: "Failed to save API key",
          variant: "destructive",
        });
        return false;
      }
    },
    [apiKeys, toast],
  );

  // Update the model
  const updateActiveModel = useCallback((model: HuggingFaceModel) => {
    setActiveModel(model);
    // Save the model preference to localStorage
    localStorage.setItem("preferredModelId", model.id);
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (content: string, parentId?: string) => {
      if (!activeChatId || !activeWorkspaceId) return;

      try {
        // Check if the query matches any skills
        let skillResult: SkillResult | undefined;
        if (skillsEnabled) {
          const matchedSkill = detectSkill(content, availableSkills);
          if (matchedSkill) {
            try {
              const result = await executeSkill(matchedSkill, content);
              skillResult = {
                skillId: matchedSkill.id,
                data: result,
              };
              console.log(`Executed skill ${matchedSkill.name}:`, result);
            } catch (error) {
              console.error(`Error executing skill:`, error);
              // Continue without skill result if there's an error
            }
          }
        }

        // Create user message
        const userMessage: ThreadedMessage = {
          id: uuidv4(),
          role: "user",
          content,
          timestamp: new Date(),
          threadId: parentId ? activeThreadId : undefined,
          parentId: parentId || undefined,
          workspaceId: activeWorkspaceId,
          skillResult: skillResult,
        };

        // Add user message to chat
        setChats((prev) => {
          const updatedChats = prev.map((chat) => {
            if (
              chat.id === activeChatId &&
              chat.workspaceId === activeWorkspaceId
            ) {
              // Auto-generate title from first user message if still default
              let updatedChat = {
                ...chat,
                messages: [...chat.messages, userMessage],
              };

              if (
                chat.title === "New Chat" &&
                !activeThreadId &&
                chat.messages.length === 1
              ) {
                // If first user message in main chat, use it as title
                updatedChat.title =
                  content.length > 30
                    ? content.substring(0, 30) + "..."
                    : content;
              }

              return updatedChat;
            }
            return chat;
          });
          return updatedChats;
        });

        setIsLoading(true);

        // Enhanced context from RAG if enabled
        let ragContext = "";
        let ragCitations = "";
        if (ragEnabled) {
          try {
            console.log("Using RAG system for query:", content);
            const ragResults = await RagSystem.query(content, {
              useAdvancedFeatures: true,
              topK: ragSettings.topK,
              similarityThreshold: ragSettings.similarityThreshold,
            });

            // Store the enhanced context and citations
            ragContext = ragResults.context || "";
            ragCitations = ragResults.citations || "";

            console.log(
              `Retrieved ${ragResults.results.length} documents with RAG`,
            );

            if (ragResults.expandedQuery) {
              console.log(`Query expanded to: ${ragResults.expandedQuery}`);
            }
          } catch (error) {
            console.error("Error using RAG system:", error);
          }
        }

        // Get AI response using the actual API
        const getAIResponse = async (query: string): Promise<string> => {
          try {
            // Create a simple message for the API call
            const messages = [
              {
                id: crypto.randomUUID(),
                role: "user",
                content: query,
                timestamp: new Date(),
              },
            ];

            // Use the queryModel function from api.ts with the active model
            return await queryModel(activeModel.id, messages, {
              temperature: 0.7,
            });
          } catch (error) {
            console.error("Error getting AI response:", error);
            return "I encountered an error processing your request. Please try again or check your API configuration.";
          }
        };

        // Small delay to ensure UI responsiveness
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Always attempt to use the real API with proper context
        let assistantContent = "";
        try {
          // Get the current chat
          const currentChat = chats.find(
            (chat) =>
              chat.id === activeChatId &&
              chat.workspaceId === activeWorkspaceId,
          );
          if (!currentChat) throw new Error("Chat not found");

          // Filter messages to get relevant context for the thread
          const contextMessages = currentChat.messages.filter((msg) => {
            if (activeThreadId) {
              return (
                msg.threadId === activeThreadId || msg.id === activeThreadId
              );
            }
            return !msg.threadId;
          });

          // Prepare web search data if enabled
          let webSearchResults = "";
          if (webSearchEnabled) {
            try {
              const searchResults = await searchWeb(
                content,
                ragSettings.searchResultsCount,
              );
              webSearchResults = formatSearchResultsAsContext(searchResults);
              console.log(
                "Web search results:",
                webSearchResults.substring(0, 100) + "...",
              );
            } catch (error) {
              console.error("Web search error:", error);
              webSearchResults =
                "Web search attempted but no results were found or available.";
            }
          }

          // Add RAG context to system message if available
          const messagesWithContext = contextMessages.map((msg) => {
            if (msg.role === "system") {
              let enhancedSystemPrompt = msg.content;

              if (ragEnabled && ragContext) {
                enhancedSystemPrompt += `\n\nRelevant Document Context:\n${ragContext}`;
              }

              if (webSearchEnabled && webSearchResults) {
                enhancedSystemPrompt += `\n\nWeb Search Results:\n${webSearchResults}`;
              }

              return {
                ...msg,
                content: enhancedSystemPrompt,
              };
            }
            return msg;
          });

          // Add the user message to the enhanced context messages
          const finalMessages = [...messagesWithContext, userMessage];

          // Call the model with enhanced context
          console.log(
            `Querying model ${activeModel.id} with ${finalMessages.length} messages`,
          );
          assistantContent = await queryModel(activeModel.id, finalMessages, {
            temperature: 0.7,
          });

          // Add citations if enabled
          if (ragEnabled && ragSettings.autoCitation && ragCitations) {
            assistantContent += `\n\n${ragCitations}`;
          }
        } catch (error) {
          console.error("Error querying model:", error);
          assistantContent = await getAIResponse(content);
        }

        // Create assistant message
        const assistantMessage: ThreadedMessage = {
          id: uuidv4(),
          role: "assistant",
          content: assistantContent,
          timestamp: new Date(),
          threadId: userMessage.threadId,
          parentId: userMessage.id,
          workspaceId: activeWorkspaceId,
        };

        // Add assistant message to chat
        setChats((prev) => {
          const updatedChats = prev.map((chat) => {
            if (
              chat.id === activeChatId &&
              chat.workspaceId === activeWorkspaceId
            ) {
              return {
                ...chat,
                messages: [...chat.messages, assistantMessage],
              };
            }
            return chat;
          });
          return updatedChats;
        });
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to send message",
          variant: "destructive",
        });

        // Remove the user message if failed
        setChats((prev) => {
          const updatedChats = prev.map((chat) => {
            if (
              chat.id === activeChatId &&
              chat.workspaceId === activeWorkspaceId
            ) {
              return {
                ...chat,
                messages: chat.messages.filter(
                  (m) => m.content !== content || m.role !== "user",
                ),
              };
            }
            return chat;
          });
          return updatedChats;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeChatId,
      activeThreadId,
      activeWorkspaceId,
      chats,
      activeModel.id,
      toast,
      ragEnabled,
      ragSettings,
      webSearchEnabled,
      getApiKey,
    ],
  );

  // Effect to save API keys to localStorage when they change
  useEffect(() => {
    if (Object.keys(apiKeys).length > 0) {
      localStorage.setItem("api_keys", JSON.stringify(apiKeys));
    }
  }, [apiKeys]);

  const value = {
    messages,
    isLoading,
    activeChatId,
    activeThreadId,
    chats,
    activeModel,
    availableModels: AVAILABLE_MODELS,
    isApiKeySet,
    ragEnabled,
    webSearchEnabled,
    ragSettings,
    skillsEnabled,
    setSkillsEnabled,
    availableSkills: availableSkills || [],
    setRagEnabled,
    setWebSearchEnabled,
    updateRagSettings,
    sendMessage,
    startThread,
    exitThread,
    startNewChat,
    switchChat,
    deleteChat,
    clearChats,
    clearAllChats,
    setApiKey: setApiKey,
    getApiKey,
    availableApiKeys,
    setActiveModel: updateActiveModel,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Create a hook to use the chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
