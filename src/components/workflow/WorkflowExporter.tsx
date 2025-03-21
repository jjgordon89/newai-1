import React, { useState } from "react";
import { Node, Edge } from "reactflow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Code, FileJson } from "lucide-react";

interface WorkflowExporterProps {
  nodes: Node[];
  edges: Edge[];
  workflowName: string;
  onImport?: (importedData: {
    nodes: Node[];
    edges: Edge[];
    name: string;
  }) => void;
}

const WorkflowExporter: React.FC<WorkflowExporterProps> = ({
  nodes,
  edges,
  workflowName,
  onImport,
}) => {
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"json" | "langchain">(
    "json",
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Generate JSON export
  const generateJsonExport = () => {
    const exportData = {
      name: workflowName,
      nodes,
      edges,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  };

  // Generate LangChain code export
  const generateLangChainCode = () => {
    // This is a simplified version - a real implementation would be more sophisticated
    let code = `// LangChain implementation of workflow: ${workflowName}\n`;
    code += `// Generated on ${new Date().toLocaleString()}\n\n`;
    code += `import { ChatOpenAI } from "langchain/chat_models/openai";\n`;
    code += `import { PromptTemplate } from "langchain/prompts";\n`;
    code += `import { LLMChain } from "langchain/chains";\n`;

    // Check for specific node types and add imports
    if (nodes.some((node) => node.type === "rag")) {
      code += `import { RetrievalQAChain } from "langchain/chains";\n`;
    }

    if (nodes.some((node) => node.type === "agent")) {
      code += `import { AgentExecutor, createReactAgent } from "langchain/agents";\n`;
      code += `import { Tool } from "langchain/tools";\n`;
    }

    if (nodes.some((node) => node.type === "webSearch")) {
      code += `import { WebBrowser } from "langchain/tools/webbrowser";\n`;
    }

    code += `\n// Main async function to run the workflow\nasync function runWorkflow(input) {\n`;

    // Add model definitions
    const llmNodes = nodes.filter((node) => node.type === "llm");
    llmNodes.forEach((node, index) => {
      const model = node.data.model || "gpt-3.5-turbo";
      const temp = node.data.temperature || 0.7;
      code += `  // Initialize ${node.data.label || "LLM " + (index + 1)}\n`;
      code += `  const llm${index + 1} = new ChatOpenAI({\n`;
      code += `    modelName: "${model}",\n`;
      code += `    temperature: ${temp},\n`;
      code += `  });\n\n`;
    });

    // Add RAG implementations
    const ragNodes = nodes.filter((node) => node.type === "rag");
    if (ragNodes.length > 0) {
      code += `  // Initialize vector store and retriever\n`;
      code += `  const vectorStore = await initializeVectorStore();  // You'll need to implement this\n`;
      code += `  const retriever = vectorStore.asRetriever({\n`;
      code += `    k: ${ragNodes[0].data.topK || 5},\n`;
      code += `  });\n\n`;
    }

    // Add agent implementations
    const agentNodes = nodes.filter((node) => node.type === "agent");
    if (agentNodes.length > 0) {
      code += `  // Initialize tools for agents\n`;
      code += `  const tools = [];\n`;

      // Check for tool usage in agents
      const agent = agentNodes[0];
      if (agent.data.tools?.webSearch) {
        code += `  tools.push(new WebBrowser({ model: llm1 }));\n`;
      }
      if (agent.data.tools?.calculator) {
        code += `  tools.push(new Calculator());\n`;
      }

      code += `\n  // Create agent\n`;
      code += `  const agent = createReactAgent(llm1, tools);\n`;
      code += `  const agentExecutor = AgentExecutor.fromAgentAndTools({\n`;
      code += `    agent,\n`;
      code += `    tools,\n`;
      code += `    maxIterations: ${agent.data.maxIterations || 10},\n`;
      code += `    verbose: true,\n`;
      code += `  });\n\n`;
    }

    // Add workflow execution
    code += `  // Execute workflow\n`;
    code += `  try {\n`;
    code += `    // Process input\n`;
    code += `    const result = await processInput(input, { `;

    // Add references to created components

    if (llmNodes.length > 0) code += `llm: llm1, `;

    if (ragNodes.length > 0) code += `retriever, `;

    if (agentNodes.length > 0) code += `agentExecutor, `;

    code += `});\n`;

    code += `    return result;\n`;

    code += `  } catch (error) {\n`;

    code += `    console.error("Workflow execution error:", error);\n`;

    code += `    throw error;\n`;

    code += `  }\n`;

    code += `}\n\n`;

    // Add helper function stub

    code += `// Helper function to process the input through the workflow\n`;

    code += `async function processInput(input, { llm, retriever, agentExecutor }) {\n`;

    code += `  // Implement your workflow logic here based on the workflow builder design\n`;

    code += `  // This is where you would chain together the different components\n\n`;

    // Add a simple implementation based on the workflow structure

    code += `  // Example implementation:\n`;

    if (llmNodes.length > 0 && ragNodes.length > 0 && agentNodes.length > 0) {
      code += `  // 1. Process input with LLM\n`;

      code += `  const llmResult = await llm.invoke(input);\n\n`;

      code += `  // 2. Retrieve relevant documents\n`;

      code += `  const docs = await retriever.getRelevantDocuments(input);\n\n`;

      code += `  // 3. Run agent with context\n`;

      code += `  const agentResult = await agentExecutor.invoke({\n`;

      code += `    input,\n`;

      code += `    context: docs.map(doc => doc.pageContent).join("\n"),\n`;

      code += `  });\n\n`;

      code += `  return agentResult;\n`;
    } else {
      code += `  // Simple pass-through implementation\n`;

      code += `  return await llm.invoke(input);\n`;
    }

    code += `}\n\n`;

    code += `// Export the workflow function\n`;

    code += `export default runWorkflow;\n`;

    return code;
  };

  // Handle export

  const handleExport = () => {
    let content = "";

    let filename = "";

    let mimeType = "";

    if (exportFormat === "json") {
      content = generateJsonExport();

      filename = `${workflowName.replace(/\s+/g, "_").toLowerCase()}_workflow.json`;

      mimeType = "application/json";
    } else {
      content = generateLangChainCode();

      filename = `${workflowName.replace(/\s+/g, "_").toLowerCase()}_langchain.js`;

      mimeType = "text/javascript";
    }

    const blob = new Blob([content], { type: mimeType });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = filename;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  // Handle import

  const handleImport = () => {
    try {
      setImportError(null);

      if (!importData.trim()) {
        setImportError("Please paste workflow JSON data");

        return;
      }

      const parsedData = JSON.parse(importData);

      // Validate imported data

      if (
        !parsedData.nodes ||
        !Array.isArray(parsedData.nodes) ||
        !parsedData.edges ||
        !Array.isArray(parsedData.edges)
      ) {
        setImportError("Invalid workflow data format");

        return;
      }

      // Call the import handler

      if (onImport) {
        onImport({
          nodes: parsedData.nodes,

          edges: parsedData.edges,

          name: parsedData.name || "Imported Workflow",
        });
      }

      setIsDialogOpen(false);

      setImportData("");
    } catch (error) {
      console.error("Import error:", error);

      setImportError(`Error importing workflow: ${error.message}`);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="flex space-x-2">
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </DialogTrigger>

        {onImport && (
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImportData("");

                setImportError(null);

                setIsDialogOpen(true);
              }}
            >
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
          </DialogTrigger>
        )}
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export/Import Workflow</DialogTitle>

          <DialogDescription>
            Export your workflow as JSON or LangChain code, or import an
            existing workflow.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>

            {onImport && <TabsTrigger value="import">Import</TabsTrigger>}
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>

              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="format-json"
                    name="export-format"
                    value="json"
                    checked={exportFormat === "json"}
                    onChange={() => setExportFormat("json")}
                    className="h-4 w-4"
                  />

                  <Label
                    htmlFor="format-json"
                    className="cursor-pointer flex items-center"
                  >
                    <FileJson className="h-4 w-4 mr-1" /> JSON
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="format-langchain"
                    name="export-format"
                    value="langchain"
                    checked={exportFormat === "langchain"}
                    onChange={() => setExportFormat("langchain")}
                    className="h-4 w-4"
                  />

                  <Label
                    htmlFor="format-langchain"
                    className="cursor-pointer flex items-center"
                  >
                    <Code className="h-4 w-4 mr-1" /> LangChain Code
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>

              <Textarea
                readOnly
                value={
                  exportFormat === "json"
                    ? generateJsonExport()
                    : generateLangChainCode()
                }
                className="font-mono text-xs h-[300px] overflow-auto"
              />
            </div>
          </TabsContent>

          {onImport && (
            <TabsContent value="import" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="import-data">Paste Workflow JSON</Label>

                <Textarea
                  id="import-data"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your workflow JSON here..."
                  className="h-[300px]"
                />

                {importError && (
                  <p className="text-sm text-destructive">{importError}</p>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>

          <Tabs.Content value="export">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </Tabs.Content>

          {onImport && (
            <Tabs.Content value="import">
              <Button onClick={handleImport} disabled={!importData.trim()}>
                <Upload className="h-4 w-4 mr-1" />
                Import Workflow
              </Button>
            </Tabs.Content>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowExporter;
