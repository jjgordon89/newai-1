/**
 * Calculator Skill - Perform mathematical calculations
 */

import {
  evaluateExpression,
  extractMathExpression,
  containsMathExpression,
} from "../calculatorService";
import { Skill, SkillResult, CalculatorResult } from "./skillTypes";

/**
 * Calculator skill implementation
 */
export const calculatorSkill: Skill = {
  id: "calculator",
  name: "Calculator",
  description: "Perform mathematical calculations",
  enabled: true,
  requiresApiKey: false,
  keywords: [
    "calculate",
    "math",
    "sum",
    "add",
    "subtract",
    "multiply",
    "divide",
    "equals",
  ],
  priority: 2,
  icon: "calculator",
  category: "utility",
  detectionFn: containsMathExpression,
  handler: async (query: string): Promise<SkillResult> => {
    try {
      const expression = extractMathExpression(query);
      const result = evaluateExpression(expression);

      const calculatorResult: CalculatorResult = {
        expression,
        result,
        formatted: `${expression} = ${result}`,
      };

      return {
        success: true,
        data: calculatorResult,
        formatted: calculatorResult.formatted,
        type: "calculator",
      };
    } catch (error) {
      console.error("Calculator error:", error);
      return {
        success: false,
        error: "Could not perform calculation",
        type: "error",
      };
    }
  },
};
