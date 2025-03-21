/**
 * Skills System - Main entry point
 *
 * This module exports all available skills and provides utilities for skill management.
 */

import { weatherSkill } from "./weatherSkill";
import { calculatorSkill } from "./calculatorSkill";
import { timeSkill } from "./timeSkill";
import { webSearchSkill } from "./webSearchSkill";
import { knowledgeBaseSkill } from "./knowledgeBaseSkill";

// Export all skills
export {
  weatherSkill,
  calculatorSkill,
  timeSkill,
  webSearchSkill,
  knowledgeBaseSkill,
};

// Export skill types
export type { Skill, SkillResult } from "./skillTypes";

// Export skill utilities
export { detectSkill, executeSkill } from "./skillUtils";

// List of all available skills
export const availableSkills = [
  weatherSkill,
  calculatorSkill,
  timeSkill,
  webSearchSkill,
  knowledgeBaseSkill,
];

/**
 * Get all enabled skills
 * @returns Array of enabled skills
 */
export function getEnabledSkills() {
  return availableSkills.filter((skill) => skill.enabled);
}

/**
 * Enable or disable a skill
 * @param skillId The skill ID
 * @param enabled Whether the skill should be enabled
 * @returns Whether the operation was successful
 */
export function setSkillEnabled(skillId: string, enabled: boolean): boolean {
  const skill = availableSkills.find((s) => s.id === skillId);
  if (!skill) return false;

  skill.enabled = enabled;
  return true;
}

/**
 * Check if a skill is available (enabled and API key set if required)
 * @param skillId The skill ID
 * @returns Whether the skill is available
 */
export function isSkillAvailable(skillId: string): boolean {
  const skill = availableSkills.find((s) => s.id === skillId);
  if (!skill || !skill.enabled) return false;

  // If the skill requires an API key, check if it's set
  if (skill.requiresApiKey && skill.isApiKeySet && !skill.isApiKeySet()) {
    return false;
  }

  return true;
}
