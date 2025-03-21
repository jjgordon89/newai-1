import { Message } from './api';

// Ollama API URL (default for local installation)
const OLLAMA_API_URL = 'http://localhost:11434/api';

// Define Ollama model type
export type OllamaModel = {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
};

// Available Ollama configuration parameters
export type OllamaParams = {
  mirostat?: number;
  mirostat_eta?: number;
  mirostat_tau?: number;
  num_ctx?: number;
  num_gqa?: number;
  num_gpu?: number;
  num_thread?: number;
  repeat_last_n?: number;
  repeat_penalty?: number;
  temperature?: number;
  seed?: number;
  stop?: string[];
  tfs_z?: number;
  num_predict?: number;
  top_k?: number;
  top_p?: number;
};

// Function to list all available models
export const listOllamaModels = async (customEndpoint?: string): Promise<OllamaModel[]> => {
  try {
    const endpoint = customEndpoint || OLLAMA_API_URL;
    const response = await fetch(`${endpoint}/tags`);
    
    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error listing Ollama models:', error);
    throw error;
  }
};

// Function to check if Ollama is running
export const checkOllamaStatus = async (customEndpoint?: string): Promise<boolean> => {
  try {
    const endpoint = customEndpoint || OLLAMA_API_URL;
    const response = await fetch(`${endpoint}/tags`, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking Ollama status:', error);
    return false;
  }
};

// Format messages for Ollama API
export const formatMessagesForOllama = (messages: Message[]): { role: string; content: string }[] => {
  return messages.map(message => ({
    role: message.role,
    content: message.content
  }));
};

// Generate completion with Ollama
export const generateWithOllama = async (
  modelName: string,
  messages: Message[],
  params: OllamaParams = {},
  customEndpoint?: string
): Promise<string> => {
  try {
    const endpoint = customEndpoint || OLLAMA_API_URL;
    const formattedMessages = formatMessagesForOllama(messages);
    
    // Remove system message from the array and use it as a system prompt
    let systemPrompt = '';
    const chatMessages = formattedMessages.filter(message => {
      if (message.role === 'system') {
        systemPrompt = message.content;
        return false;
      }
      return true;
    });
    
    const payload = {
      model: modelName,
      messages: chatMessages,
      system: systemPrompt,
      options: params,
      stream: false
    };
    
    const response = await fetch(`${endpoint}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${errorText}`);
    }
    
    const data = await response.json();
    return data.message?.content || '';
  } catch (error) {
    console.error('Error generating completion with Ollama:', error);
    throw error;
  }
};

// Helper to save Ollama endpoint configuration
export const saveOllamaEndpoint = (endpoint: string) => {
  localStorage.setItem('ollama_endpoint', endpoint);
};

// Helper to get Ollama endpoint configuration
export const getOllamaEndpoint = (): string => {
  return localStorage.getItem('ollama_endpoint') || OLLAMA_API_URL;
};