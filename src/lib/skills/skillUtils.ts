/**
 * Skill Utilities - Helper functions for the skills system
 */

import { Skill, SkillResult } from "./skillTypes";

/**
 * Detect which skill should handle a query
 * @param query The user query
 * @param skills Array of available skills
 * @returns The matching skill or null if no match
 */
export function detectSkill(query: string, skills: Skill[]): Skill | null {
  const lowerQuery = query.toLowerCase();

  // First try to match using custom detection functions
  const skillsWithDetectionFn = skills
    .filter(
      (skill) =>
        skill.enabled &&
        (!skill.requiresApiKey || !skill.isApiKeySet || skill.isApiKeySet()),
    )
    .filter((skill) => skill.detectionFn && skill.detectionFn(query))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  if (skillsWithDetectionFn.length > 0) {
    return skillsWithDetectionFn[0];
  }

  // Fall back to keyword matching
  for (const skill of skills) {
    if (!skill.enabled) continue;

    // If the skill requires an API key and it's not set, skip it
    if (skill.requiresApiKey && skill.isApiKeySet && !skill.isApiKeySet()) {
      continue;
    }

    // Check if query contains any keywords for this skill
    if (
      skill.keywords.some((keyword) =>
        lowerQuery.includes(keyword.toLowerCase()),
      )
    ) {
      return skill;
    }
  }

  return null;
}

/**
 * Execute a skill with a query
 * @param skill The skill to execute
 * @param query The query to execute
 * @param options Optional parameters for the skill
 * @returns The skill result
 */
export async function executeSkill(
  skill: Skill,
  query: string,
  options?: any,
): Promise<SkillResult> {
  try {
    return await skill.handler(query, options);
  } catch (error) {
    console.error(`Error executing skill ${skill.name}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      type: "error",
    };
  }
}

/**
 * Format a skill result for display
 * @param result The skill result
 * @returns Formatted string
 */
export function formatSkillResult(result: SkillResult): string {
  if (!result.success) {
    return `Error: ${result.error || "Unknown error"}`;
  }

  if (result.formatted) {
    return result.formatted;
  }

  // Default formatting based on result type
  switch (result.type) {
    case "weather":
      return formatWeatherResult(result.data);
    case "calculator":
      return formatCalculatorResult(result.data);
    case "time":
      return formatTimeResult(result.data);
    case "search":
      return formatSearchResult(result.data);
    case "knowledge":
      return formatKnowledgeResult(result.data);
    default:
      return JSON.stringify(result.data);
  }
}

/**
 * Format weather result
 */
function formatWeatherResult(data: any): string {
  if (!data) return "No weather data available";

  let result = `Weather in ${data.location}: ${data.temperature}°C, ${data.condition}`;

  if (data.humidity) {
    result += `, Humidity: ${data.humidity}%`;
  }

  if (data.windSpeed) {
    result += `, Wind: ${data.windSpeed} km/h`;
  }

  if (data.forecast && data.forecast.length > 0) {
    result += "\n\nForecast:";
    data.forecast.forEach((day: any) => {
      result += `\n${day.day}: ${day.temperature}°C, ${day.condition}`;
    });
  }

  return result;
}

/**
 * Format calculator result
 */
function formatCalculatorResult(data: any): string {
  if (!data) return "No calculation result available";
  return `${data.expression} = ${data.result}`;
}

/**
 * Format time result
 */
function formatTimeResult(data: any): string {
  if (!data) return "No time data available";
  return `Current time: ${data.currentTime}\nCurrent date: ${data.currentDate}\nDay: ${data.day}`;
}

/**
 * Format search result
 */
function formatSearchResult(data: any): string {
  if (!data || !data.results || data.results.length === 0) {
    return "No search results available";
  }

  let result = `Search results for "${data.query}":\n\n`;

  data.results.forEach((item: any, index: number) => {
    result += `${index + 1}. ${item.title}\n${item.snippet}\n${item.url}\n\n`;
  });

  return result;
}

/**
 * Format knowledge result
 */
function formatKnowledgeResult(data: any): string {
  if (!data) return "No knowledge base results available";

  let result = data.content;

  if (data.sources && data.sources.length > 0) {
    result += "\n\nSources:\n";
    data.sources.forEach((source: any, index: number) => {
      result += `${index + 1}. ${source.title} (${Math.round(source.similarity * 100)}% match)\n`;
    });
  }

  return result;
}
