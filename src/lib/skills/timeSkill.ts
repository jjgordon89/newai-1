/**
 * Time Skill - Get current time and date information
 */

import {
  getCurrentDateTime,
  isTimeQuery,
  formatTimeResponse,
} from "../timeService";
import { Skill, SkillResult, TimeData } from "./skillTypes";

/**
 * Time skill implementation
 */
export const timeSkill: Skill = {
  id: "time",
  name: "Time",
  description: "Get current time and date information",
  enabled: true,
  requiresApiKey: false,
  keywords: ["time", "date", "day", "today", "current time", "current date"],
  priority: 3,
  icon: "clock",
  category: "utility",
  detectionFn: isTimeQuery,
  handler: async (): Promise<SkillResult> => {
    try {
      const timeData = getCurrentDateTime();
      const formatted = formatTimeResponse();

      return {
        success: true,
        data: {
          ...timeData,
          formatted,
        },
        formatted,
        type: "time",
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
