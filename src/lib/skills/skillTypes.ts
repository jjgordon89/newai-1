/**
 * Skill Types - Type definitions for the skills system
 */

/**
 * Skill interface
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiresApiKey?: boolean;
  isApiKeySet?: () => boolean;
  handler: (query: string, options?: any) => Promise<SkillResult>;
  keywords: string[];
  detectionFn?: (query: string) => boolean;
  priority?: number; // Higher number means higher priority
  icon?: string;
  category?: SkillCategory;
}

/**
 * Skill result interface
 */
export interface SkillResult {
  success: boolean;
  data?: any;
  error?: string;
  formatted?: string;
  type?: SkillResultType;
  sources?: string[];
}

/**
 * Skill result type
 */
export type SkillResultType =
  | "text"
  | "weather"
  | "calculator"
  | "time"
  | "search"
  | "knowledge"
  | "error";

/**
 * Skill category
 */
export type SkillCategory =
  | "utility"
  | "knowledge"
  | "search"
  | "productivity"
  | "entertainment"
  | "communication";

/**
 * Weather data interface
 */
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
  forecast?: WeatherForecast[];
}

/**
 * Weather forecast interface
 */
export interface WeatherForecast {
  day: string;
  temperature: number;
  condition: string;
}

/**
 * Calculator result interface
 */
export interface CalculatorResult {
  expression: string;
  result: number;
  formatted: string;
}

/**
 * Time data interface
 */
export interface TimeData {
  currentTime: string;
  currentDate: string;
  day: string;
  formatted: string;
}

/**
 * Web search result interface
 */
export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Knowledge base result interface
 */
export interface KnowledgeBaseResult {
  content: string;
  sources: {
    id: string;
    title: string;
    similarity: number;
  }[];
}
