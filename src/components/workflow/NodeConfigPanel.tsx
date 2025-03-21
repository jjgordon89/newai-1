import React from "react";
import { Node } from "reactflow";
import { Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NodeType } from "@/lib/workflowTypes";
import { RAGNodeConfigPanel } from "./panels/RAGNodeConfigPanel";
import { LanceDbRagNodePanel } from "./panels/LanceDbRagNodePanel";
import { KnowledgeBaseNodePanel } from "./panels/KnowledgeBaseNodePanel";
import { AgentNodePanel } from "./panels/AgentNodePanel";

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onUpdate,
}) => {
  const handleChange = (key: string, value: any) => {
    onUpdate(node.id, { [key]: value });
  };

  const renderCommonConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="node-label">Node Label</Label>
        <Input
          id="node-label"
          value={node.data.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Enter node label"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="node-description">Description</Label>
        <Textarea
          id="node-description"
          value={node.data.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="What does this node do?"
          rows={3}
        />
      </div>
    </div>
  );

  const renderLLMConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="llm-model">LLM Model</Label>
        <Select
          value={node.data.model || "gpt-4"}
          onValueChange={(value) => handleChange("model", value)}
        >
          <SelectTrigger id="llm-model">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-3">Claude 3</SelectItem>
            <SelectItem value="mistral">Mistral AI</SelectItem>
            <SelectItem value="llama-3">Llama 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="llm-prompt">Prompt Template</Label>
        <Textarea
          id="llm-prompt"
          value={node.data.prompt || ""}
          onChange={(e) => handleChange("prompt", e.target.value)}
          placeholder="Enter your prompt template, use {{variable}} for variables"
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          Use curly braces to reference variables, e.g., {"{{"}"user_input{"}}"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="llm-system-prompt">System Prompt (Optional)</Label>
        <Textarea
          id="llm-system-prompt"
          value={node.data.systemPrompt || ""}
          onChange={(e) => handleChange("systemPrompt", e.target.value)}
          placeholder="Optional system prompt instructions"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="llm-temperature">
            Temperature: {node.data.temperature || 0.7}
          </Label>
        </div>
        <Slider
          id="llm-temperature"
          min={0}
          max={1}
          step={0.1}
          value={[node.data.temperature || 0.7]}
          onValueChange={(value) => handleChange("temperature", value[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Precise (0)</span>
          <span>Creative (1)</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="llm-max-tokens">Max Output Tokens</Label>
        <Input
          id="llm-max-tokens"
          type="number"
          value={node.data.maxTokens || 1000}
          onChange={(e) => handleChange("maxTokens", parseInt(e.target.value))}
          min={1}
          max={4000}
        />
      </div>
    </div>
  );

  const renderRAGConfig = () => (
    <RAGNodeConfigPanel
      id={node.id}
      data={node.data}
      onChange={(id, newData) => {
        // Update the node data with all properties from newData
        const mergedData = { ...node.data, ...newData };
        onUpdate(id, mergedData);
      }}
    />
  );

  const renderLanceDbConfig = () => (
    <LanceDbRagNodePanel
      data={node.data}
      onChange={(newData) => {
        // Update the node data with all properties from newData
        onUpdate(node.id, newData);
      }}
    />
  );

  const renderKnowledgeBaseConfig = () => (
    <KnowledgeBaseNodePanel
      data={node.data}
      onChange={(newData) => {
        // Update the node data with all properties from newData
        onUpdate(node.id, newData);
      }}
    />
  );

  const renderWebSearchConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search-provider">Search Provider</Label>
        <Select
          value={node.data.searchProvider || "brave"}
          onValueChange={(value) => handleChange("searchProvider", value)}
        >
          <SelectTrigger id="search-provider">
            <SelectValue placeholder="Select search provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brave">Brave Search</SelectItem>
            <SelectItem value="google">Google Search</SelectItem>
            <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
            <SelectItem value="serpapi">SerpAPI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="search-query">Search Query Template</Label>
        <Textarea
          id="search-query"
          value={node.data.query || ""}
          onChange={(e) => handleChange("query", e.target.value)}
          placeholder="Enter search query or template with variables"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Use {"{{"}"variable{"}}"} to incorporate variables from previous nodes
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="search-count">Result Count</Label>
        <Input
          id="search-count"
          type="number"
          value={node.data.resultCount || 5}
          onChange={(e) =>
            handleChange("resultCount", parseInt(e.target.value))
          }
          min={1}
          max={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="safe-search">Safe Search</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="safe-search"
            checked={node.data.safeSearch !== false}
            onCheckedChange={(checked) => handleChange("safeSearch", checked)}
          />
          <Label htmlFor="safe-search" className="cursor-pointer">
            Enable safe search filtering
          </Label>
        </div>
      </div>
    </div>
  );

  const renderConditionalConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="condition-expr">Condition Expression</Label>
        <Textarea
          id="condition-expr"
          value={node.data.condition || ""}
          onChange={(e) => handleChange("condition", e.target.value)}
          placeholder="Enter a JavaScript condition (e.g., input.length > 5)"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          JavaScript expression that evaluates to true or false
        </p>
      </div>
    </div>
  );

  const renderInputOutputConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="var-name">Variable Name</Label>
        <Input
          id="var-name"
          value={node.data.variableName || ""}
          onChange={(e) => handleChange("variableName", e.target.value)}
          placeholder="Enter variable name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="var-type">Data Type</Label>
        <Select
          value={node.data.dataType || "string"}
          onValueChange={(value) => handleChange("dataType", value)}
        >
          <SelectTrigger id="var-type">
            <SelectValue placeholder="Select data type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="object">Object</SelectItem>
            <SelectItem value="array">Array</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="var-default">Default Value (Optional)</Label>
        <Input
          id="var-default"
          value={node.data.defaultValue || ""}
          onChange={(e) => handleChange("defaultValue", e.target.value)}
          placeholder="Enter default value"
        />
      </div>
    </div>
  );

  const renderFunctionConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="func-name">Function Name</Label>
        <Input
          id="func-name"
          value={node.data.functionName || ""}
          onChange={(e) => handleChange("functionName", e.target.value)}
          placeholder="Enter function name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="func-code">Function Code</Label>
        <Textarea
          id="func-code"
          value={node.data.code || ""}
          onChange={(e) => handleChange("code", e.target.value)}
          placeholder="Enter JavaScript code for your function"
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          JavaScript function that takes input and returns output
        </p>
      </div>
    </div>
  );

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trigger-type">Trigger Type</Label>
        <Select
          value={node.data.triggerType || "manual"}
          onValueChange={(value) => handleChange("triggerType", value)}
        >
          <SelectTrigger id="trigger-type">
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Trigger</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {node.data.triggerType === "scheduled" && (
        <div className="space-y-2">
          <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
          <Input
            id="schedule"
            value={node.data.schedule || ""}
            onChange={(e) => handleChange("schedule", e.target.value)}
            placeholder="Enter cron expression (e.g., 0 0 * * *)"
          />
          <p className="text-xs text-muted-foreground">
            Cron expression for scheduling (e.g., "0 0 * * *" for daily at
            midnight)
          </p>
        </div>
      )}

      {node.data.triggerType === "webhook" && (
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              id="webhook-url"
              value={
                node.data.webhookUrl || "https://example.com/webhook/123456"
              }
              readOnly
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-clipboard"
              >
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Render different configuration options based on node type
  const renderAgentConfig = () => (
    <AgentNodePanel
      nodeId={node.id}
      data={node.data}
      onUpdate={(id, newData) => {
        onUpdate(id, newData);
      }}
    />
  );

  const renderNodeTypeConfig = () => {
    switch (node.type as NodeType) {
      case "llm":
        return renderLLMConfig();
      case "rag":
        return renderRAGConfig();
      case "lancedb":
        return renderLanceDbConfig();
      case "knowledge-base":
        return renderKnowledgeBaseConfig();
      case "web-search":
        return renderWebSearchConfig();
      case "conditional":
        return renderConditionalConfig();
      case "input":
      case "output":
        return renderInputOutputConfig();
      case "function":
        return renderFunctionConfig();
      case "trigger":
        return renderTriggerConfig();
      case "agent":
        return renderAgentConfig();
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 border-b pb-3">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Node Configuration</h3>
      </div>

      {renderCommonConfig()}

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Type-specific Configuration</h4>
        {renderNodeTypeConfig()}
      </div>
    </div>
  );
};
