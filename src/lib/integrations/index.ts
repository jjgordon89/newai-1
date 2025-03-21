/**
 * Integrations Index
 *
 * Exports all integration services and connectors
 */

// External Knowledge Sources
import webSearchIntegration from "./webSearchIntegration";
import externalDatabaseIntegration from "./externalDatabaseIntegration";
import thirdPartyApiIntegration from "./thirdPartyApiIntegration";
import unifiedQueryInterface from "./unifiedQueryInterface";

// AI Model Integration
import aiModelIntegration from "./aiModelIntegration";

// Enterprise Connectors
import sharepointConnector from "./enterpriseConnectors/sharepointConnector";
import googleWorkspaceConnector from "./enterpriseConnectors/googleWorkspaceConnector";
import notionConnector from "./enterpriseConnectors/notionConnector";
import confluenceConnector from "./enterpriseConnectors/confluenceConnector";

// Export all integrations
export {
  // External Knowledge Sources
  webSearchIntegration,
  externalDatabaseIntegration,
  thirdPartyApiIntegration,
  unifiedQueryInterface,

  // AI Model Integration
  aiModelIntegration,

  // Enterprise Connectors
  sharepointConnector,
  googleWorkspaceConnector,
  notionConnector,
  confluenceConnector,
};

// Export types
export type { WebSearchOptions, WebSearchResult } from "./webSearchIntegration";
export type {
  DatabaseConnectionConfig,
  QueryOptions,
} from "./externalDatabaseIntegration";
export type { ApiConfig, ApiRequestOptions } from "./thirdPartyApiIntegration";
export type {
  DataSourceType,
  DataSourceConfig,
  UnifiedQueryOptions,
  UnifiedQueryResult,
} from "./unifiedQueryInterface";
export type {
  ModelProvider,
  ModelConfig,
  ModelRequestOptions,
  ModelResponse,
} from "./aiModelIntegration";
export type {
  SharePointConfig,
  SharePointDocument,
  SharePointListItem,
  SharePointSearchOptions,
} from "./enterpriseConnectors/sharepointConnector";
export type {
  GoogleWorkspaceConfig,
  GoogleDocument,
  GoogleFolder,
  GoogleSearchOptions,
} from "./enterpriseConnectors/googleWorkspaceConnector";
export type {
  NotionConfig,
  NotionPage,
  NotionDatabase,
  NotionBlock,
  NotionSearchOptions,
} from "./enterpriseConnectors/notionConnector";
export type {
  ConfluenceConfig,
  ConfluencePage,
  ConfluenceSpace,
  ConfluenceSearchOptions,
} from "./enterpriseConnectors/confluenceConnector";

// Initialize function to set up all integrations
export const initializeIntegrations = () => {
  console.log("Initializing all integrations...");

  // This function would typically load configuration from environment variables or a config file
  // and initialize each integration service with the appropriate settings

  return {
    webSearch: webSearchIntegration,
    externalDb: externalDatabaseIntegration,
    thirdPartyApi: thirdPartyApiIntegration,
    unifiedQuery: unifiedQueryInterface,
    aiModel: aiModelIntegration,
    sharepoint: sharepointConnector,
    googleWorkspace: googleWorkspaceConnector,
    notion: notionConnector,
    confluence: confluenceConnector,
  };
};

// Default export
export default {
  initializeIntegrations,
  webSearchIntegration,
  externalDatabaseIntegration,
  thirdPartyApiIntegration,
  unifiedQueryInterface,
  aiModelIntegration,
  sharepointConnector,
  googleWorkspaceConnector,
  notionConnector,
  confluenceConnector,
};
