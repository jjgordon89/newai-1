/**
 * Knowledge Analytics Service
 *
 * Provides analytics for document usage, queries, and user interactions
 */

import { getQueryAnalytics, getQueryLogs } from "./queryProcessing";
import {
  getDocumentUsageAnalytics,
  getTopPerformingDocuments,
} from "./knowledgeRetrievalService";

export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
}

export interface KnowledgeAnalytics {
  queryAnalytics: {
    totalQueries: number;
    uniqueQueries: number;
    averageQueryLength: number;
    topQueries: { query: string; count: number }[];
    queriesOverTime: { date: string; count: number }[];
  };
  documentAnalytics: {
    topDocuments: {
      documentId: string;
      documentName: string;
      usageCount: number;
      averageRelevance: number;
    }[];
    documentUsageOverTime: { date: string; count: number }[];
  };
  userInteractionAnalytics: {
    totalInteractions: number;
    averageSessionDuration: number;
    interactionsOverTime: { date: string; count: number }[];
  };
}

// In-memory store for user interactions (would be replaced with a database in production)
interface UserInteraction {
  userId: string;
  sessionId: string;
  interactionType: "search" | "view" | "feedback" | "citation";
  timestamp: number;
  metadata: Record<string, any>;
}

const userInteractions: UserInteraction[] = [];

/**
 * Track a user interaction
 * @param interaction User interaction data
 */
export function trackUserInteraction(interaction: UserInteraction): void {
  userInteractions.push(interaction);

  // Keep the interaction log size manageable
  if (userInteractions.length > 10000) {
    userInteractions.splice(0, userInteractions.length - 10000);
  }
}

/**
 * Get user interaction analytics
 * @param period Optional time period filter
 * @param userId Optional user filter
 * @returns User interaction analytics
 */
export function getUserInteractionAnalytics(
  period?: AnalyticsPeriod,
  userId?: string,
): {
  totalInteractions: number;
  averageSessionDuration: number;
  interactionsOverTime: { date: string; count: number }[];
  interactionsByType: { type: string; count: number }[];
} {
  // Filter interactions
  let filtered = [...userInteractions];

  if (period) {
    const startTime = period.startDate.getTime();
    const endTime = period.endDate.getTime();
    filtered = filtered.filter(
      (i) => i.timestamp >= startTime && i.timestamp <= endTime,
    );
  }

  if (userId) {
    filtered = filtered.filter((i) => i.userId === userId);
  }

  if (filtered.length === 0) {
    return {
      totalInteractions: 0,
      averageSessionDuration: 0,
      interactionsOverTime: [],
      interactionsByType: [],
    };
  }

  // Calculate total interactions
  const totalInteractions = filtered.length;

  // Calculate interactions over time (by day)
  const interactionDates: Record<string, number> = {};
  filtered.forEach((interaction) => {
    const date = new Date(interaction.timestamp).toISOString().split("T")[0];
    interactionDates[date] = (interactionDates[date] || 0) + 1;
  });

  const interactionsOverTime = Object.entries(interactionDates)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate interactions by type
  const interactionTypes: Record<string, number> = {};
  filtered.forEach((interaction) => {
    interactionTypes[interaction.interactionType] =
      (interactionTypes[interaction.interactionType] || 0) + 1;
  });

  const interactionsByType = Object.entries(interactionTypes)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate average session duration
  // Group interactions by session
  const sessionInteractions: Record<string, number[]> = {};
  filtered.forEach((interaction) => {
    if (!sessionInteractions[interaction.sessionId]) {
      sessionInteractions[interaction.sessionId] = [];
    }
    sessionInteractions[interaction.sessionId].push(interaction.timestamp);
  });

  // Calculate duration for each session
  let totalDuration = 0;
  let sessionCount = 0;

  Object.values(sessionInteractions).forEach((timestamps) => {
    if (timestamps.length < 2) return;

    // Sort timestamps
    timestamps.sort((a, b) => a - b);

    // Calculate duration (last timestamp - first timestamp)
    const duration = timestamps[timestamps.length - 1] - timestamps[0];

    // Only count sessions with reasonable durations (< 2 hours)
    if (duration > 0 && duration < 7200000) {
      totalDuration += duration;
      sessionCount++;
    }
  });

  const averageSessionDuration =
    sessionCount > 0 ? totalDuration / sessionCount : 0;

  return {
    totalInteractions,
    averageSessionDuration,
    interactionsOverTime,
    interactionsByType,
  };
}

/**
 * Get comprehensive knowledge analytics
 * @param workspaceId Optional workspace filter
 * @param period Optional time period filter
 * @returns Comprehensive knowledge analytics
 */
export function getKnowledgeAnalytics(
  workspaceId?: string,
  period?: AnalyticsPeriod,
): KnowledgeAnalytics {
  // Get query analytics
  const queryAnalytics = getQueryAnalytics(workspaceId);

  // Get document analytics
  const topDocuments = getTopPerformingDocuments(10, workspaceId);

  // Get document usage over time
  const documentUsage = getDocumentUsageAnalytics();

  // Get user interaction analytics
  const userAnalytics = getUserInteractionAnalytics(period);

  return {
    queryAnalytics,
    documentAnalytics: {
      topDocuments,
      documentUsageOverTime: documentUsage.usageOverTime,
    },
    userInteractionAnalytics: {
      totalInteractions: userAnalytics.totalInteractions,
      averageSessionDuration: userAnalytics.averageSessionDuration,
      interactionsOverTime: userAnalytics.interactionsOverTime,
    },
  };
}

/**
 * Record user feedback on a search result
 * @param documentId Document ID
 * @param queryId Query ID
 * @param userId User ID
 * @param rating Feedback rating (1-5)
 * @param comments Optional feedback comments
 */
export function recordUserFeedback(
  documentId: string,
  queryId: string,
  userId: string,
  rating: number,
  comments?: string,
): void {
  // In a real implementation, this would store the feedback in a database
  // For this implementation, we'll track it as a user interaction
  trackUserInteraction({
    userId,
    sessionId: `session_${userId}_${Date.now()}`,
    interactionType: "feedback",
    timestamp: Date.now(),
    metadata: {
      documentId,
      queryId,
      rating,
      comments,
    },
  });
}

/**
 * Get document performance metrics
 * @param documentId Document ID
 * @returns Document performance metrics
 */
export function getDocumentPerformanceMetrics(documentId: string): {
  usageCount: number;
  averageRelevance: number;
  feedbackRating: number;
  clickThroughRate: number;
} {
  // Get document usage analytics
  const usageAnalytics = getDocumentUsageAnalytics(documentId);

  // Calculate feedback rating
  const feedbackInteractions = userInteractions.filter(
    (i) =>
      i.interactionType === "feedback" && i.metadata.documentId === documentId,
  );

  let feedbackRating = 0;
  if (feedbackInteractions.length > 0) {
    const totalRating = feedbackInteractions.reduce(
      (sum, i) => sum + (i.metadata.rating || 0),
      0,
    );
    feedbackRating = totalRating / feedbackInteractions.length;
  }

  // Calculate click-through rate
  const searchInteractions = userInteractions.filter(
    (i) =>
      i.interactionType === "search" &&
      i.metadata.results?.includes(documentId),
  ).length;

  const viewInteractions = userInteractions.filter(
    (i) => i.interactionType === "view" && i.metadata.documentId === documentId,
  ).length;

  const clickThroughRate =
    searchInteractions > 0 ? viewInteractions / searchInteractions : 0;

  return {
    usageCount: usageAnalytics.totalUsage,
    averageRelevance: usageAnalytics.averageRelevance,
    feedbackRating,
    clickThroughRate,
  };
}
