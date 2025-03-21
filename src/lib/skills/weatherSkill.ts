/**
 * Weather Skill - Get weather information for locations
 */

import { getWeatherData, isWeatherApiKeySet } from "../weatherService";
import { Skill, SkillResult, WeatherData } from "./skillTypes";

/**
 * Weather skill implementation
 */
export const weatherSkill: Skill = {
  id: "weather",
  name: "Weather",
  description: "Get weather information for locations",
  enabled: true,
  requiresApiKey: true,
  isApiKeySet: isWeatherApiKeySet,
  keywords: [
    "weather",
    "temperature",
    "forecast",
    "rain",
    "sunny",
    "cloudy",
    "humidity",
    "climate",
  ],
  priority: 1,
  icon: "cloud",
  category: "utility",
  detectionFn: (query: string) => {
    const weatherRegex = /weather (?:in|for|at) ([a-zA-Z\s,]+)/i;
    return weatherRegex.test(query);
  },
  handler: async (query: string): Promise<SkillResult> => {
    try {
      // Extract location from query
      const locationRegex = /weather (?:in|for|at) ([a-zA-Z\s,]+)/i;
      const match = query.match(locationRegex);

      if (!match || !match[1]) {
        return {
          success: false,
          error: "Location not found in query",
          type: "error",
        };
      }

      const location = match[1].trim();
      const weatherData = await getWeatherData(location);

      // Format the weather data for display
      const formatted = formatWeatherResponse(weatherData);

      return {
        success: true,
        data: weatherData,
        formatted,
        type: "weather",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      };
    }
  },
};

/**
 * Format weather data into a human-readable response
 * @param data Weather data
 * @returns Formatted weather response
 */
function formatWeatherResponse(data: WeatherData): string {
  let response = `Weather in ${data.location}: ${data.temperature}°C, ${data.condition}`;

  if (data.humidity !== undefined) {
    response += `\nHumidity: ${data.humidity}%`;
  }

  if (data.windSpeed !== undefined) {
    response += `\nWind Speed: ${data.windSpeed} km/h`;
  }

  if (data.forecast && data.forecast.length > 0) {
    response += "\n\nForecast:";
    data.forecast.forEach((day) => {
      response += `\n${day.day}: ${day.temperature}°C, ${day.condition}`;
    });
  }

  return response;
}
