import { Message } from './api';

// OpenRouter API URL
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

// Define OpenRouter model type
export type OpenRouterModel = {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
  top_provider: {
    id: string;
    name: string;
  };
};

// OpenRouter generation parameters
export type OpenRouterParams = {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop?: string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
};

// Function to list all available models from OpenRouter
export const listOpenRouterModels = async (apiKey: string): Promise<OpenRouterModel[]> => {
  try {
    const response = await fetch(`${OPENROUTER_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Chatbot'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error listing OpenRouter models:', error);
    throw error;
  }
};

// Function to check if OpenRouter API key is valid
export const checkOpenRouterStatus = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`${OPENROUTER_API_URL}/auth/key`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Chatbot'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking OpenRouter status:', error);
    return false;
  }
};

// Format messages for OpenRouter API
// OpenRouter expects OpenAI-compatible format
export const formatMessagesForOpenRouter = (messages: Message[]): { role: string; content: string | object }[] => {
  return messages.map(message => {
    // Handle text messages
    if (typeof message.content === 'string') {
      return {
        role: message.role,
        content: message.content
      };
    }
    
    // Handle multimodal messages (with images)
    return {
      role: message.role,
      content: message.content
    };
  });
};

// Generate completion with OpenRouter
export const generateWithOpenRouter = async (
  modelId: string,
  messages: Message[],
  params: OpenRouterParams = {},
  apiKey: string
): Promise<string> => {
  try {
    const formattedMessages = formatMessagesForOpenRouter(messages);
    
    const payload = {
      model: modelId,
      messages: formattedMessages,
      ...params
    };
    
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Chatbot'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating completion with OpenRouter:', error);
    throw error;
  }
};

// Helper to save OpenRouter API key configuration
export const saveOpenRouterApiKey = (apiKey: string) => {
  localStorage.setItem('openrouter_api_key', apiKey);
};

// Helper to get OpenRouter API key configuration
export const getOpenRouterApiKey = (): string => {
  return localStorage.getItem('openrouter_api_key') || '';
};