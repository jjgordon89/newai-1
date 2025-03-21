import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import {
  Book,
  Search,
  FileText,
  BarChart3,
  Settings,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const KnowledgeBaseNode = memo(
  ({ id, data, isConnectable, selected }: NodeProps) => {
    // Get retrieval method display
    const getRetrievalMethod = () => {
      const method = data.retrievalMethod || "hybrid";

      switch (method.toLowerCase()) {
        case "semantic":
          return "Semantic Search";
        case "keyword":
          return "Keyword Search";
        case "hybrid":
          return "Hybrid Search";
        default:
          return method.charAt(0).toUpperCase() + method.slice(1);
      }
    };

    // Get workspace name
    const getWorkspaceName = () => {
      return data.workspaceName || data.workspaceId || "Default Workspace";
    };

    // Get result format display
    const getResultFormat = () => {
      const format = data.formatResults || "text";

      switch (format.toLowerCase()) {
        case "text":
          return "Text";
        case "json":
          return "JSON";
        case "compact":
          return "Compact";
        case "citations-only":
          return "Citations Only";
        case "raw":
          return "Raw";
        default:
          return format.charAt(0).toUpperCase() + format.slice(1);
      }
    };

    // Show filter count
    const filterCount = data.filterOptions
      ? Object.keys(data.filterOptions).length
      : 0;

    // Format query preview
    const queryPreview = () => {
      if (!data.query) {
        return <span className="italic">No query specified</span>;
      }

      return (
        <div className="truncate">
          {data.query.length > 40
            ? `${data.query.substring(0, 40)}...`
            : data.query}
        </div>
      );
    };

    return (
      <BaseNode
        id={id}
        data={data}
        isConnectable={isConnectable}
        selected={selected}
        icon={<Book className="h-4 w-4 text-emerald-500" />}
        color="bg-emerald-50"
      >
        <div className="space-y-3">
          {/* Workspace info */}
          <div className="flex items-center justify-between mb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 px-1.5 py-0 text-xs font-normal"
                  >
                    {getWorkspaceName()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Workspace: {getWorkspaceName()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Search className="h-3.5 w-3.5 mr-1" />
                      <span>{getRetrievalMethod()}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Retrieval Method: {getRetrievalMethod()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Query */}
          <div className="flex items-start gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center">
                <p className="text-xs font-medium mb-1">Query</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {queryPreview()}
              </div>
            </div>
          </div>

          {/* Retrieval parameters */}
          <div className="flex items-start gap-2">
            <Settings className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium mb-1">Retrieval Parameters</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <div>Top K: {data.topK || 5}</div>
                <div>Threshold: {data.similarityThreshold || 70}%</div>
                <div>Format: {getResultFormat()}</div>
                {data.maxContextLength && (
                  <div>Context length: {data.maxContextLength}</div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          {filterCount > 0 && (
            <div className="flex items-start gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium mb-1">Filters</p>
                <div className="text-xs text-muted-foreground">
                  {filterCount === 1
                    ? "1 filter applied"
                    : `${filterCount} filters applied`}
                </div>
              </div>
            </div>
          )}

          {/* Results preview (if execution completed and has output) */}
          {data.isCompleted && data.output && (
            <div className="mt-2 border-t pt-2">
              <p className="text-xs font-medium mb-1 flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1" />
                Results
              </p>
              <div className="text-xs text-muted-foreground">
                {data.output.documentCount ? (
                  <span>{data.output.documentCount} documents retrieved</span>
                ) : (
                  <span>No documents found</span>
                )}
                {data.output.executionTime && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({Math.round(data.output.executionTime)}ms)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </BaseNode>
    );
  },
);

KnowledgeBaseNode.displayName = "KnowledgeBaseNode";
