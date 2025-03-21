/**
 * Node Executors Index
 * Exports all node executors and registers them with the workflow engine
 */

import { registerNodeExecutor } from "../workflowEngine";

// Import all node executors
import llmNodeExecutor from "./llmNodeExecutor";
import ragNodeExecutor from "./ragNodeExecutor";
import lanceDbNodeExecutor from "./lanceDbNodeExecutor";
import knowledgeBaseNodeExecutor from "./knowledgeBaseNodeExecutor";
import webSearchNodeExecutor from "./webSearchNodeExecutor";
import functionNodeExecutor from "./functionNodeExecutor";
import conditionalNodeExecutor from "./conditionalNodeExecutor";
import triggerNodeExecutor from "./triggerNodeExecutor";
import outputNodeExecutor from "./outputNodeExecutor";

// Register all node executors
export function registerAllNodeExecutors(): void {
  registerNodeExecutor("llm", llmNodeExecutor);
  registerNodeExecutor("rag", ragNodeExecutor);
  registerNodeExecutor("lancedb", lanceDbNodeExecutor);
  registerNodeExecutor("knowledge-base", knowledgeBaseNodeExecutor);
  registerNodeExecutor("web-search", webSearchNodeExecutor);
  registerNodeExecutor("function", functionNodeExecutor);
  registerNodeExecutor("conditional", conditionalNodeExecutor);
  registerNodeExecutor("trigger", triggerNodeExecutor);
  registerNodeExecutor("output", outputNodeExecutor);
}

// Export all node executors
export {
  llmNodeExecutor,
  ragNodeExecutor,
  lanceDbNodeExecutor,
  knowledgeBaseNodeExecutor,
  webSearchNodeExecutor,
  functionNodeExecutor,
  conditionalNodeExecutor,
  triggerNodeExecutor,
  outputNodeExecutor,
};

export default {
  registerAllNodeExecutors,
};
