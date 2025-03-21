
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

// Define workspace type
export type Workspace = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  icon?: string; // Icon for the workspace
  color?: string; // Color for the workspace
  llmConfig?: any; // LLM configuration for the workspace
  documents?: { id: string; name: string; path: string }[];
  agentConfig?: any; // Agent configuration for the workspace
  tags?: string[]; // Tags for categorizing workspaces
  pinned?: boolean; // Whether the workspace is pinned to the top
  lastAccessed?: Date; // When the workspace was last accessed
  settings?: {
    apiKeys?: Record<string, string>;
    webSearch?: {
      preferredEngine?: string;
      [provider: string]: any;
    };
    models?: {
      embeddingModel?: string;
      llmModel?: string;
      [key: string]: any;
    };
    rag?: {
      chunkSize?: number;
      chunkOverlap?: number;
      retrievalK?: number;
      [key: string]: any;
    };
    [section: string]: any;
  };
};

// Define workspace context type
type WorkspaceContextType = {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  createWorkspace: (name: string, description?: string, icon?: string, color?: string) => Workspace;
  updateWorkspace: (id: string, data: Partial<Workspace & { llmConfig: any }>) => boolean;
  deleteWorkspace: (id: string) => boolean;
  switchWorkspace: (id: string) => void;
  addDocument: (workspaceId: string, document: { id: string; name: string; path: string }) => void;
  listDocuments: (workspaceId: string) => { id: string; name: string; path: string }[] | undefined;
  deleteDocument: (workspaceId: string, documentId: string) => void;
  clearAllWorkspaces: () => void; // New function to clear all workspaces
};

// Create the context
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Create a provider component
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize from localStorage
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('workspaces');
    const savedActiveWorkspaceId = localStorage.getItem('activeWorkspaceId');
    
    if (savedWorkspaces) {
      try {
        // Parse workspaces and ensure Date objects are properly converted
        const parsedWorkspaces: Workspace[] = JSON.parse(savedWorkspaces).map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt)
        }));
        setWorkspaces(parsedWorkspaces);
      } catch (e) {
        console.error('Failed to parse saved workspaces:', e);
      }
    }
    
    if (savedActiveWorkspaceId) {
      setActiveWorkspaceId(savedActiveWorkspaceId);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem('workspaces', JSON.stringify(workspaces));
    }
    
    if (activeWorkspaceId) {
      localStorage.setItem('activeWorkspaceId', activeWorkspaceId);
    }
  }, [workspaces, activeWorkspaceId]);

  // Create a new workspace
  const createWorkspace = (
    name: string,
    description?: string,
    icon?: string,
    color?: string,
    llmConfig?: any,
    agentConfig?: any,
    tags?: string[],
    pinned?: boolean
  ): Workspace => {
    const now = new Date();
    const newWorkspace: Workspace = {
      id: uuidv4(),
      name,
      description,
      createdAt: now,
      lastAccessed: now,
      icon,
      color,
      llmConfig,
      agentConfig,
      tags: tags || [],
      pinned: pinned || false
    };
    
    setWorkspaces(prev => [...prev, newWorkspace]);
    
    // If this is the first workspace, make it active
    if (workspaces.length === 0) {
      setActiveWorkspaceId(newWorkspace.id);
    }
    
    toast({
      title: "Workspace Created",
      description: `Created new workspace: ${name}`
    });
    
    return newWorkspace;
  };

  // Update an existing workspace
  const updateWorkspace = (id: string, data: Partial<Workspace>): boolean => {
    let updated = false;

    setWorkspaces(prev => {
      const index = prev.findIndex(w => w.id === id);
      if (index === -1) return prev;
      
      updated = true;
      const updatedWorkspaces = [...prev];
      
      // Update workspace with new data
      updatedWorkspaces[index] = {
        ...updatedWorkspaces[index],
        ...data,
        // Update lastAccessed timestamp when workspace is modified
        lastAccessed: new Date()
      };
      
      return updatedWorkspaces;
    });
    
    if (updated) {
      toast({
        title: "Workspace Updated",
        description: `Updated workspace details`
      });
    }
    
    return updated;
  };

  // Delete a workspace
  const deleteWorkspace = (id: string): boolean => {
    // Don't delete if it's the only workspace
    if (workspaces.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one workspace",
        variant: "destructive"
      });
      return false;
    }
    
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    
    // If deleting the active workspace, switch to another one
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(workspaces.find(w => w.id !== id)?.id || null);
    }
    
    toast({
      title: "Workspace Deleted",
      description: `Deleted workspace`
    });
    
    return true;
  };

  // Switch to a different workspace
  const switchWorkspace = (id: string) => {
    const workspace = workspaces.find(w => w.id === id);
    if (!workspace) return;
    
    setActiveWorkspaceId(id);
    
    // Update lastAccessed time for the workspace
    setWorkspaces(prev => {
      return prev.map(w => {
        if (w.id === id) {
          return { ...w, lastAccessed: new Date() };
        }
        return w;
      });
    });
    
    toast({
      title: "Workspace Switched",
      description: `Switched to workspace: ${workspace.name}`
    });
  };

  // Add a document to a workspace
  const addDocument = (workspaceId: string, document: { id: string; name: string; path: string }) => {
    setWorkspaces(prev => {
      const updatedWorkspaces = [...prev];
      const workspaceIndex = updatedWorkspaces.findIndex(w => w.id === workspaceId);

      if (workspaceIndex === -1) return prev; // Workspace not found

      if (!updatedWorkspaces[workspaceIndex].documents) {
        updatedWorkspaces[workspaceIndex].documents = [];
      }

      updatedWorkspaces[workspaceIndex].documents?.push(document);
      return updatedWorkspaces;
    });
  };

  // List documents in a workspace
  const listDocuments = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace?.documents;
  };

  // Delete a document from a workspace
  const deleteDocument = (workspaceId: string, documentId: string) => {
    setWorkspaces(prev => {
      const updatedWorkspaces = [...prev];
      const workspaceIndex = updatedWorkspaces.findIndex(w => w.id === workspaceId);

      if (workspaceIndex === -1) return prev; // Workspace not found

      updatedWorkspaces[workspaceIndex].documents = updatedWorkspaces[workspaceIndex].documents?.filter(doc => doc.id !== documentId);
      return updatedWorkspaces;
    });
  };

  // Clear all workspaces and reset active workspace
  const clearAllWorkspaces = () => {
    setWorkspaces([]);
    setActiveWorkspaceId(null);
    localStorage.removeItem('workspaces');
    localStorage.removeItem('activeWorkspaceId');
    toast({
      title: "Workspaces Cleared",
      description: "All workspaces have been removed"
    });
  };


  // Initialize with a default workspace if needed
  useEffect(() => {
    // If no workspaces exist, create a default one
    if (workspaces.length === 0) {
      console.log("No workspaces found in state, creating default");
      const newWorkspace: Workspace = {
        id: uuidv4(),
        name: "My Workspace",
        description: "Default workspace",
        createdAt: new Date()
      };
      
      setWorkspaces([newWorkspace]);
      setActiveWorkspaceId(newWorkspace.id);
      
      // Force save to localStorage
      localStorage.setItem('workspaces', JSON.stringify([newWorkspace]));
      localStorage.setItem('activeWorkspaceId', newWorkspace.id);
      
      console.log("Created default workspace:", newWorkspace);
    } else if (!activeWorkspaceId && workspaces.length > 0) {
      // If there are workspaces but no active one, set the first as active
      console.log("Setting active workspace to first available");
      setActiveWorkspaceId(workspaces[0].id);
      localStorage.setItem('activeWorkspaceId', workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId]);

  const value = {
    workspaces,
    activeWorkspaceId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
    addDocument,
    listDocuments,
    deleteDocument,
    clearAllWorkspaces
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// Create a hook to use the workspace context
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
