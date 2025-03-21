/**
 * Implementation Roadmap for Knowledge Management System
 * This file defines the structured implementation plan with phases, tasks, and dependencies
 */

export interface Task {
  id: string;
  name: string;
  description: string;
  estimatedDays: number;
  dependencies: string[];
  status: "not-started" | "in-progress" | "completed";
  assignee?: string;
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  startDate?: Date;
  endDate?: Date;
  status: "not-started" | "in-progress" | "completed";
  dependencies: string[];
}

export interface Roadmap {
  name: string;
  description: string;
  phases: Phase[];
  startDate?: Date;
  endDate?: Date;
  currentPhase?: string;
}

export const knowledgeManagementRoadmap: Roadmap = {
  name: "Knowledge Management System Implementation",
  description:
    "A comprehensive plan for implementing the knowledge management system with document processing, vector storage, and workflow integration",
  phases: [
    {
      id: "phase-1",
      name: "Document Management Foundation",
      description:
        "Establish the core document management functionality including storage, processing, and basic API",
      status: "not-started",
      dependencies: [],
      tasks: [
        {
          id: "task-1-1",
          name: "Implement local storage adapter",
          description:
            "Create a storage adapter for local development that handles document upload and retrieval",
          estimatedDays: 2,
          dependencies: [],
          status: "not-started",
          priority: "high",
          tags: ["backend", "storage"],
        },
        {
          id: "task-1-2",
          name: "Create document repository interface",
          description:
            "Define the interface for document repositories to ensure consistent API across different storage backends",
          estimatedDays: 1,
          dependencies: [],
          status: "not-started",
          priority: "high",
          tags: ["backend", "architecture"],
        },
        {
          id: "task-1-3",
          name: "Implement file upload service",
          description:
            "Create a service for handling file uploads with progress tracking and validation",
          estimatedDays: 3,
          dependencies: ["task-1-1", "task-1-2"],
          status: "not-started",
          priority: "critical",
          tags: ["backend", "storage"],
        },
        {
          id: "task-1-4",
          name: "Implement text extraction for PDFs",
          description:
            "Create a text extraction service for PDF documents using pdfjs-dist",
          estimatedDays: 3,
          dependencies: ["task-1-3"],
          status: "not-started",
          priority: "high",
          tags: ["backend", "processing"],
        },
        {
          id: "task-1-5",
          name: "Implement text extraction for other formats",
          description:
            "Add support for extracting text from DOCX, TXT, and MD files",
          estimatedDays: 2,
          dependencies: ["task-1-4"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "processing"],
        },
        {
          id: "task-1-6",
          name: "Create metadata extraction service",
          description:
            "Implement a service to extract metadata from documents (author, date, etc.)",
          estimatedDays: 2,
          dependencies: ["task-1-4"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "processing"],
        },
        {
          id: "task-1-7",
          name: "Connect document uploader UI to backend",
          description:
            "Integrate the document uploader component with the storage backend",
          estimatedDays: 2,
          dependencies: ["task-1-3"],
          status: "not-started",
          priority: "high",
          tags: ["frontend", "integration"],
        },
        {
          id: "task-1-8",
          name: "Implement document retrieval endpoints",
          description:
            "Create API endpoints for retrieving documents and their content",
          estimatedDays: 2,
          dependencies: ["task-1-3"],
          status: "not-started",
          priority: "high",
          tags: ["backend", "api"],
        },
        {
          id: "task-1-9",
          name: "Add document chunking strategies",
          description:
            "Implement different strategies for chunking documents for vector storage",
          estimatedDays: 3,
          dependencies: ["task-1-5"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "processing"],
        },
      ],
    },
    {
      id: "phase-2",
      name: "Vector Database Integration",
      description:
        "Integrate LanceDB for vector storage and implement embedding generation and vector search",
      status: "not-started",
      dependencies: ["phase-1"],
      tasks: [
        {
          id: "task-2-1",
          name: "Initialize LanceDB connection",
          description:
            "Set up the connection to LanceDB and create the necessary configuration",
          estimatedDays: 1,
          dependencies: [],
          status: "not-started",
          priority: "critical",
          tags: ["backend", "database"],
        },
        {
          id: "task-2-2",
          name: "Create schema for document vectors",
          description:
            "Define the schema for storing document vectors in LanceDB",
          estimatedDays: 1,
          dependencies: ["task-2-1"],
          status: "not-started",
          priority: "high",
          tags: ["backend", "database"],
        },
        {
          id: "task-2-3",
          name: "Integrate with Hugging Face embedding models",
          description:
            "Set up integration with Hugging Face for generating embeddings",
          estimatedDays: 3,
          dependencies: [],
          status: "not-started",
          priority: "high",
          tags: ["backend", "ai"],
        },
        {
          id: "task-2-4",
          name: "Implement embedding pipeline for documents",
          description:
            "Create a pipeline for generating embeddings from document chunks",
          estimatedDays: 3,
          dependencies: ["task-1-9", "task-2-3"],
          status: "not-started",
          priority: "critical",
          tags: ["backend", "ai"],
        },
        {
          id: "task-2-5",
          name: "Implement vector storage service",
          description:
            "Create a service for storing document vectors in LanceDB",
          estimatedDays: 2,
          dependencies: ["task-2-2", "task-2-4"],
          status: "not-started",
          priority: "critical",
          tags: ["backend", "database"],
        },
        {
          id: "task-2-6",
          name: "Implement semantic search functionality",
          description:
            "Create a service for performing semantic search using document vectors",
          estimatedDays: 3,
          dependencies: ["task-2-5"],
          status: "not-started",
          priority: "high",
          tags: ["backend", "search"],
        },
        {
          id: "task-2-7",
          name: "Add filtering options for vector search",
          description:
            "Implement filtering by metadata, tags, and other attributes",
          estimatedDays: 2,
          dependencies: ["task-2-6"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "search"],
        },
        {
          id: "task-2-8",
          name: "Implement hybrid search",
          description:
            "Create a hybrid search combining vector and keyword search",
          estimatedDays: 3,
          dependencies: ["task-2-6"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "search"],
        },
        {
          id: "task-2-9",
          name: "Add batch processing for document indexing",
          description:
            "Implement batch processing to handle large document collections",
          estimatedDays: 2,
          dependencies: ["task-2-5"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "performance"],
        },
      ],
    },
    {
      id: "phase-3",
      name: "Knowledge Base API",
      description:
        "Implement the knowledge base API for query processing, retrieval, and analytics",
      status: "not-started",
      dependencies: ["phase-2"],
      tasks: [
        {
          id: "task-3-1",
          name: "Implement query preprocessing",
          description:
            "Create a service for preprocessing user queries before retrieval",
          estimatedDays: 2,
          dependencies: [],
          status: "not-started",
          priority: "high",
          tags: ["backend", "search"],
        },
        {
          id: "task-3-2",
          name: "Create query expansion techniques",
          description:
            "Implement techniques for expanding queries to improve retrieval",
          estimatedDays: 3,
          dependencies: ["task-3-1"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "search"],
        },
        {
          id: "task-3-3",
          name: "Create retrieval API endpoints",
          description: "Implement API endpoints for knowledge retrieval",
          estimatedDays: 2,
          dependencies: ["task-2-6"],
          status: "not-started",
          priority: "critical",
          tags: ["backend", "api"],
        },
        {
          id: "task-3-4",
          name: "Implement context building from retrieved documents",
          description:
            "Create a service for building context from retrieved document chunks",
          estimatedDays: 3,
          dependencies: ["task-3-3"],
          status: "not-started",
          priority: "high",
          tags: ["backend", "processing"],
        },
        {
          id: "task-3-5",
          name: "Add relevance scoring",
          description: "Implement relevance scoring for retrieved documents",
          estimatedDays: 2,
          dependencies: ["task-3-3"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "search"],
        },
        {
          id: "task-3-6",
          name: "Create citation generation",
          description:
            "Implement citation generation for retrieved information",
          estimatedDays: 2,
          dependencies: ["task-3-4"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "processing"],
        },
        {
          id: "task-3-7",
          name: "Implement document usage tracking",
          description: "Create a system for tracking document usage in queries",
          estimatedDays: 2,
          dependencies: ["task-3-3"],
          status: "not-started",
          priority: "low",
          tags: ["backend", "analytics"],
        },
        {
          id: "task-3-8",
          name: "Enhance analytics dashboard",
          description:
            "Update the analytics dashboard with query and document metrics",
          estimatedDays: 3,
          dependencies: ["task-3-7"],
          status: "not-started",
          priority: "low",
          tags: ["frontend", "analytics"],
        },
        {
          id: "task-3-9",
          name: "Implement query logging",
          description: "Create a system for logging queries and their results",
          estimatedDays: 1,
          dependencies: ["task-3-3"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "analytics"],
        },
      ],
    },
    {
      id: "phase-4",
      name: "Workflow Integration",
      description: "Integrate the knowledge base with the workflow system",
      status: "not-started",
      dependencies: ["phase-3"],
      tasks: [
        {
          id: "task-4-1",
          name: "Update RAG node with knowledge base integration",
          description:
            "Enhance the existing RAG node to use the knowledge base",
          estimatedDays: 3,
          dependencies: ["task-3-3"],
          status: "not-started",
          priority: "critical",
          tags: ["frontend", "workflow"],
        },
        {
          id: "task-4-2",
          name: "Add configuration options for retrieval",
          description: "Implement configuration options for the RAG node",
          estimatedDays: 2,
          dependencies: ["task-4-1"],
          status: "not-started",
          priority: "high",
          tags: ["frontend", "workflow"],
        },
        {
          id: "task-4-3",
          name: "Implement context window management",
          description:
            "Create a system for managing the context window size in RAG",
          estimatedDays: 2,
          dependencies: ["task-4-1"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "workflow"],
        },
        {
          id: "task-4-4",
          name: "Create dedicated knowledge base node",
          description:
            "Implement a specialized node for knowledge base operations",
          estimatedDays: 3,
          dependencies: ["task-3-3"],
          status: "not-started",
          priority: "high",
          tags: ["frontend", "workflow"],
        },
        {
          id: "task-4-5",
          name: "Implement query customization options",
          description:
            "Add options for customizing queries in the knowledge base node",
          estimatedDays: 2,
          dependencies: ["task-4-4"],
          status: "not-started",
          priority: "medium",
          tags: ["frontend", "workflow"],
        },
        {
          id: "task-4-6",
          name: "Add result formatting capabilities",
          description: "Implement options for formatting retrieval results",
          estimatedDays: 2,
          dependencies: ["task-4-4"],
          status: "not-started",
          priority: "medium",
          tags: ["frontend", "workflow"],
        },
        {
          id: "task-4-7",
          name: "Create RAG workflow templates",
          description: "Develop template workflows for common RAG use cases",
          estimatedDays: 2,
          dependencies: ["task-4-1", "task-4-4"],
          status: "not-started",
          priority: "low",
          tags: ["frontend", "workflow"],
        },
        {
          id: "task-4-8",
          name: "Implement document processing workflows",
          description: "Create workflow templates for document processing",
          estimatedDays: 2,
          dependencies: ["task-4-4"],
          status: "not-started",
          priority: "low",
          tags: ["frontend", "workflow"],
        },
        {
          id: "task-4-9",
          name: "Create example workflows",
          description:
            "Develop example workflows showcasing knowledge base capabilities",
          estimatedDays: 2,
          dependencies: ["task-4-7", "task-4-8"],
          status: "not-started",
          priority: "low",
          tags: ["frontend", "workflow"],
        },
      ],
    },
    {
      id: "phase-5",
      name: "UI/UX Enhancements",
      description:
        "Enhance the user interface and experience for the knowledge management system",
      status: "not-started",
      dependencies: ["phase-1"],
      tasks: [
        {
          id: "task-5-1",
          name: "Enhance document list with advanced filtering",
          description: "Add advanced filtering options to the document list",
          estimatedDays: 2,
          dependencies: [],
          status: "not-started",
          priority: "medium",
          tags: ["frontend", "ui"],
        },
        {
          id: "task-5-2",
          name: "Improve document viewer with annotations",
          description: "Add annotation capabilities to the document viewer",
          estimatedDays: 3,
          dependencies: [],
          status: "not-started",
          priority: "low",
          tags: ["frontend", "ui"],
        },
        {
          id: "task-5-3",
          name: "Implement document organization",
          description:
            "Add support for organizing documents with folders and tags",
          estimatedDays: 3,
          dependencies: [],
          status: "not-started",
          priority: "medium",
          tags: ["frontend", "ui"],
        },
        {
          id: "task-5-4",
          name: "Create knowledge graph visualization",
          description: "Implement a visualization for document relationships",
          estimatedDays: 4,
          dependencies: ["phase-3"],
          status: "not-started",
          priority: "low",
          tags: ["frontend", "visualization"],
        },
        {
          id: "task-5-5",
          name: "Enhance analytics with predictive insights",
          description: "Add predictive analytics to the dashboard",
          estimatedDays: 3,
          dependencies: ["task-3-8"],
          status: "not-started",
          priority: "low",
          tags: ["frontend", "analytics"],
        },
        {
          id: "task-5-6",
          name: "Add custom report generation",
          description: "Implement custom report generation for analytics",
          estimatedDays: 3,
          dependencies: ["task-3-8"],
          status: "not-started",
          priority: "low",
          tags: ["frontend", "analytics"],
        },
      ],
    },
    {
      id: "phase-6",
      name: "Testing & Deployment",
      description: "Test the system and prepare for deployment",
      status: "not-started",
      dependencies: ["phase-3", "phase-4"],
      tasks: [
        {
          id: "task-6-1",
          name: "Implement load testing",
          description: "Create load tests for document processing and search",
          estimatedDays: 2,
          dependencies: [],
          status: "not-started",
          priority: "medium",
          tags: ["testing", "performance"],
        },
        {
          id: "task-6-2",
          name: "Optimize query response times",
          description: "Improve performance of query processing and retrieval",
          estimatedDays: 3,
          dependencies: ["task-6-1"],
          status: "not-started",
          priority: "medium",
          tags: ["backend", "performance"],
        },
        {
          id: "task-6-3",
          name: "Add document access controls",
          description: "Implement access control for documents",
          estimatedDays: 3,
          dependencies: [],
          status: "not-started",
          priority: "high",
          tags: ["backend", "security"],
        },
        {
          id: "task-6-4",
          name: "Create deployment documentation",
          description: "Document the deployment process",
          estimatedDays: 2,
          dependencies: [],
          status: "not-started",
          priority: "medium",
          tags: ["documentation"],
        },
        {
          id: "task-6-5",
          name: "Add monitoring and alerting",
          description: "Implement monitoring and alerting for the system",
          estimatedDays: 2,
          dependencies: [],
          status: "not-started",
          priority: "medium",
          tags: ["devops"],
        },
        {
          id: "task-6-6",
          name: "Create backup and recovery procedures",
          description: "Document backup and recovery procedures",
          estimatedDays: 1,
          dependencies: [],
          status: "not-started",
          priority: "medium",
          tags: ["devops"],
        },
      ],
    },
    {
      id: "phase-7",
      name: "Documentation & Training",
      description: "Create documentation and training materials",
      status: "not-started",
      dependencies: ["phase-6"],
      tasks: [
        {
          id: "task-7-1",
          name: "Create user guides",
          description: "Develop comprehensive user guides",
          estimatedDays: 3,
          dependencies: [],
          status: "not-started",
          priority: "medium",
          tags: ["documentation"],
        },
        {
          id: "task-7-2",
          name: "Document API endpoints",
          description: "Create documentation for all API endpoints",
          estimatedDays: 2,
          dependencies: [],
          status: "not-started",
          priority: "high",
          tags: ["documentation"],
        },
        {
          id: "task-7-3",
          name: "Implement in-app tutorials",
          description: "Add interactive tutorials to the application",
          estimatedDays: 3,
          dependencies: [],
          status: "not-started",
          priority: "low",
          tags: ["frontend", "documentation"],
        },
        {
          id: "task-7-4",
          name: "Create integration guides",
          description: "Develop guides for integrating with the system",
          estimatedDays: 2,
          dependencies: [],
          status: "not-started",
          priority: "medium",
          tags: ["documentation"],
        },
        {
          id: "task-7-5",
          name: "Add code documentation",
          description: "Document the codebase with comments and documentation",
          estimatedDays: 3,
          dependencies: [],
          status: "not-started",
          priority: "medium",
          tags: ["documentation"],
        },
      ],
    },
  ],
};

/**
 * Get the critical path tasks from the roadmap
 * @param roadmap The implementation roadmap
 * @returns Array of critical path tasks
 */
export function getCriticalPathTasks(roadmap: Roadmap): Task[] {
  const criticalTasks: Task[] = [];

  roadmap.phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      if (task.priority === "critical") {
        criticalTasks.push(task);
      }
    });
  });

  return criticalTasks;
}

/**
 * Get the next tasks to work on based on dependencies and status
 * @param roadmap The implementation roadmap
 * @returns Array of next tasks to work on
 */
export function getNextTasks(roadmap: Roadmap): Task[] {
  const nextTasks: Task[] = [];
  const completedTaskIds = new Set<string>();

  // Collect all completed task IDs
  roadmap.phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      if (task.status === "completed") {
        completedTaskIds.add(task.id);
      }
    });
  });

  // Find tasks that can be started
  roadmap.phases.forEach((phase) => {
    if (phase.status === "not-started" || phase.status === "in-progress") {
      // Check if phase dependencies are met
      const phaseCanStart = phase.dependencies.every((depId) => {
        const depPhase = roadmap.phases.find((p) => p.id === depId);
        return depPhase?.status === "completed";
      });

      if (phaseCanStart || phase.dependencies.length === 0) {
        phase.tasks.forEach((task) => {
          if (task.status === "not-started") {
            // Check if task dependencies are met
            const canStart = task.dependencies.every((depId) =>
              completedTaskIds.has(depId),
            );
            if (canStart || task.dependencies.length === 0) {
              nextTasks.push(task);
            }
          }
        });
      }
    }
  });

  // Sort by priority
  return nextTasks.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Calculate the estimated completion date for the roadmap
 * @param roadmap The implementation roadmap
 * @param startDate The start date for the roadmap
 * @param teamSize The number of team members working on the roadmap
 * @returns The estimated completion date
 */
export function calculateCompletionDate(
  roadmap: Roadmap,
  startDate: Date,
  teamSize: number,
): Date {
  // Simple calculation assuming tasks can be parallelized based on team size
  let totalDays = 0;

  // Calculate critical path length
  const phaseMap = new Map<string, number>();

  // Calculate days per phase considering dependencies
  roadmap.phases.forEach((phase) => {
    let phaseDays = 0;

    // Group tasks by their dependencies to determine which can be parallelized
    const taskGroups: Task[][] = [];
    const processedTasks = new Set<string>();

    // Process tasks with no dependencies first
    const noDependencyTasks = phase.tasks.filter(
      (task) => task.dependencies.length === 0,
    );
    if (noDependencyTasks.length > 0) {
      taskGroups.push(noDependencyTasks);
      noDependencyTasks.forEach((task) => processedTasks.add(task.id));
    }

    // Process remaining tasks based on dependencies
    while (processedTasks.size < phase.tasks.length) {
      const availableTasks = phase.tasks.filter(
        (task) =>
          !processedTasks.has(task.id) &&
          task.dependencies.every((depId) => processedTasks.has(depId)),
      );

      if (availableTasks.length === 0) break; // Avoid infinite loop if there are circular dependencies

      taskGroups.push(availableTasks);
      availableTasks.forEach((task) => processedTasks.add(task.id));
    }

    // Calculate days needed for each group considering team size
    taskGroups.forEach((group) => {
      const totalGroupDays = group.reduce(
        (sum, task) => sum + task.estimatedDays,
        0,
      );
      phaseDays += Math.ceil(totalGroupDays / teamSize);
    });

    phaseMap.set(phase.id, phaseDays);
  });

  // Calculate total days considering phase dependencies
  const processedPhases = new Set<string>();
  const phaseGroups: Phase[][] = [];

  // Process phases with no dependencies first
  const noDependencyPhases = roadmap.phases.filter(
    (phase) => phase.dependencies.length === 0,
  );
  if (noDependencyPhases.length > 0) {
    phaseGroups.push(noDependencyPhases);
    noDependencyPhases.forEach((phase) => processedPhases.add(phase.id));
  }

  // Process remaining phases based on dependencies
  while (processedPhases.size < roadmap.phases.length) {
    const availablePhases = roadmap.phases.filter(
      (phase) =>
        !processedPhases.has(phase.id) &&
        phase.dependencies.every((depId) => processedPhases.has(depId)),
    );

    if (availablePhases.length === 0) break; // Avoid infinite loop if there are circular dependencies

    phaseGroups.push(availablePhases);
    availablePhases.forEach((phase) => processedPhases.add(phase.id));
  }

  // Calculate total days
  phaseGroups.forEach((group) => {
    const maxPhaseDays = Math.max(
      ...group.map((phase) => phaseMap.get(phase.id) || 0),
    );
    totalDays += maxPhaseDays;
  });

  // Add buffer for weekends and unexpected delays (20%)
  totalDays = Math.ceil(totalDays * 1.2);

  // Calculate completion date
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + totalDays);

  return completionDate;
}
