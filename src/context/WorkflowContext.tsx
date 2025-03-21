import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workflow, WorkflowNode, WorkflowEdge, WorkflowTemplate } from '@/lib/workflowTypes';

// Sample workflow templates
const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'openrouter-agent-template',
    name: 'OpenRouter AI Agent',
    description: 'An AI agent workflow that leverages OpenRouter models',
    category: 'agent',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          label: 'User Input',
          variableName: 'userQuery',
          dataType: 'string',
          description: 'The user query to process'
        }
      },
      {
        id: 'agent-1',
        type: 'agent',
        position: { x: 100, y: 250 },
        data: {
          label: 'AI Agent',
          name: 'OpenRouter Assistant',
          description: 'A powerful AI agent using OpenRouter models',
          model: 'openrouter/anthropic/claude-3-opus',
          temperature: 0.7,
          maxTokens: 2048,
          systemPrompt: 'You are a helpful, friendly AI assistant powered by OpenRouter models. Answer questions accurately and concisely.',
          skills: ['rag', 'web-search', 'code'],
          memory: {
            enabled: true,
            contextWindow: 10
          },
          ragSettings: {
            enabled: true,
            similarityThreshold: 0.7,
            maxRetrievedDocs: 3
          }
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 100, y: 400 },
        data: {
          label: 'Agent Response',
          variableName: 'agentResponse',
          dataType: 'string',
          description: 'The final response from the AI agent'
        }
      }
    ],
    edges: [
      {
        id: 'edge-input-agent',
        source: 'input-1',
        target: 'agent-1',
        type: 'default'
      },
      {
        id: 'edge-agent-output',
        source: 'agent-1',
        target: 'output-1',
        type: 'default'
      }
    ]
  },
  {
    id: 'template-1',
    name: 'Simple RAG Agent',
    description: 'A basic workflow that uses retrieval augmented generation to answer questions.',
    category: 'general',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          label: 'User Input',
          variableName: 'userQuery',
          dataType: 'string',
          description: 'The user query to process'
        }
      },
      {
        id: 'rag-1',
        type: 'rag',
        position: { x: 100, y: 250 },
        data: {
          label: 'RAG Retrieval',
          description: 'Retrieves relevant documents',
          retrievalMethod: 'similarity',
          topK: 3,
          documents: []
        }
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 100, y: 400 },
        data: {
          label: 'LLM Processing',
          description: 'Generates a response based on retrieved documents',
          model: 'gpt-4',
          prompt: 'Based on the retrieved documents, please answer: {{userQuery}}',
          temperature: 0.7
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 100, y: 550 },
        data: {
          label: 'Final Response',
          variableName: 'response',
          dataType: 'string',
          description: 'The final response to send back to the user'
        }
      }
    ],
    edges: [
      {
        id: 'edge-input-rag',
        source: 'input-1',
        target: 'rag-1',
        type: 'default'
      },
      {
        id: 'edge-rag-llm',
        source: 'rag-1',
        target: 'llm-1',
        type: 'default'
      },
      {
        id: 'edge-llm-output',
        source: 'llm-1',
        target: 'output-1',
        type: 'default'
      }
    ]
  },
  {
    id: 'template-2',
    name: 'Web Search Enhanced Agent',
    description: 'A workflow that combines web search with LLM processing.',
    category: 'general',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          label: 'User Query',
          variableName: 'userQuery',
          dataType: 'string',
          description: 'The user query to process'
        }
      },
      {
        id: 'web-search-1',
        type: 'web-search',
        position: { x: 100, y: 250 },
        data: {
          label: 'Web Search',
          description: 'Searches the web for information',
          query: '{{userQuery}}',
          resultCount: 5
        }
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 100, y: 400 },
        data: {
          label: 'LLM Processing',
          description: 'Analyzes search results and generates a response',
          model: 'gpt-4',
          prompt: 'Using the following web search results, please answer: {{userQuery}}\n\nSearch Results:\n{{web-search-1.results}}',
          temperature: 0.7
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 100, y: 550 },
        data: {
          label: 'Final Response',
          variableName: 'response',
          dataType: 'string',
          description: 'The final response to send back to the user'
        }
      }
    ],
    edges: [
      {
        id: 'edge-input-search',
        source: 'input-1',
        target: 'web-search-1',
        type: 'default'
      },
      {
        id: 'edge-search-llm',
        source: 'web-search-1',
        target: 'llm-1',
        type: 'default'
      },
      {
        id: 'edge-llm-output',
        source: 'llm-1',
        target: 'output-1',
        type: 'default'
      }
    ]
  }
];

interface WorkflowContextType {
  workflows: Workflow[];
  activeWorkflowId: string | null;
  templates: WorkflowTemplate[];
  setActiveWorkflowId: (id: string | null) => void;
  getWorkflow: (id: string) => Workflow | undefined;
  createWorkflow: (name: string, description?: string, templateId?: string, category?: string) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  addNode: (workflowId: string, node: Omit<WorkflowNode, 'id'>) => string;
  updateNode: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode['data']>) => void;
  deleteNode: (workflowId: string, nodeId: string) => void;
  addEdge: (workflowId: string, edge: Omit<WorkflowEdge, 'id'>) => string;
  deleteEdge: (workflowId: string, edgeId: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(WORKFLOW_TEMPLATES);

  // Load workflows from localStorage on mount
  useEffect(() => {
    const savedWorkflows = localStorage.getItem('workflows');
    if (savedWorkflows) {
      try {
        setWorkflows(JSON.parse(savedWorkflows));
      } catch (error) {
        console.error('Failed to parse saved workflows:', error);
      }
    }
  }, []);

  // Save workflows to localStorage when they change
  useEffect(() => {
    if (workflows.length > 0) {
      localStorage.setItem('workflows', JSON.stringify(workflows));
    }
  }, [workflows]);

  const getWorkflow = (id: string) => {
    return workflows.find(w => w.id === id);
  };

  const createWorkflow = (name: string, description = '', templateId?: string, category?: string): Workflow => {
    let initialNodes: WorkflowNode[] = [];
    let initialEdges: WorkflowEdge[] = [];

    // Use template if provided
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        initialNodes = [...template.nodes];
        initialEdges = [...template.edges];
        // Use template category if no category is provided
        if (!category && template.category) {
          category = template.category;
        }
      }
    }

    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name,
      description,
      category: category || 'General',
      nodes: initialNodes,
      edges: initialEdges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWorkflows(prev => [...prev, newWorkflow]);
    return newWorkflow;
  };

  const updateWorkflow = (id: string, updates: Partial<Workflow>) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === id 
          ? { 
              ...workflow, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            } 
          : workflow
      )
    );
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
    if (activeWorkflowId === id) {
      setActiveWorkflowId(null);
    }
  };

  const addNode = (workflowId: string, node: Omit<WorkflowNode, 'id'>): string => {
    const nodeId = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      ...node,
      id: nodeId
    };

    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? {
              ...workflow,
              nodes: [...workflow.nodes, newNode],
              updatedAt: new Date().toISOString()
            }
          : workflow
      )
    );

    return nodeId;
  };

  const updateNode = (workflowId: string, nodeId: string, updates: Partial<WorkflowNode['data']>) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? {
              ...workflow,
              nodes: workflow.nodes.map(node => 
                node.id === nodeId 
                  ? { ...node, data: { ...node.data, ...updates } }
                  : node
              ),
              updatedAt: new Date().toISOString()
            }
          : workflow
      )
    );
  };

  const deleteNode = (workflowId: string, nodeId: string) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? {
              ...workflow,
              // Remove the node
              nodes: workflow.nodes.filter(node => node.id !== nodeId),
              // Remove any edges connected to the node
              edges: workflow.edges.filter(edge => 
                edge.source !== nodeId && edge.target !== nodeId
              ),
              updatedAt: new Date().toISOString()
            }
          : workflow
      )
    );
  };

  const addEdge = (workflowId: string, edge: Omit<WorkflowEdge, 'id'>): string => {
    const edgeId = `edge-${Date.now()}`;
    const newEdge: WorkflowEdge = {
      ...edge,
      id: edgeId
    };

    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? {
              ...workflow,
              edges: [...workflow.edges, newEdge],
              updatedAt: new Date().toISOString()
            }
          : workflow
      )
    );

    return edgeId;
  };

  const deleteEdge = (workflowId: string, edgeId: string) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? {
              ...workflow,
              edges: workflow.edges.filter(edge => edge.id !== edgeId),
              updatedAt: new Date().toISOString()
            }
          : workflow
      )
    );
  };

  const value = {
    workflows,
    activeWorkflowId,
    templates,
    setActiveWorkflowId,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};