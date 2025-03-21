import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { Button } from '@/components/ui/button';
import { CompactModelRecommendations } from './ModelRecommendations';
import { CompactPromptSuggestions } from './PromptSuggestions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileUp,
  FilePlus,
  Settings,
  Database,
  FileType,
  BookText,
  FolderOpen,
  Edit,
  Folder
} from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import NotesSection from "@/components/NotesSection";
import { StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  addDocumentToStore, 
  getAllDocuments, 
  deleteDocument, 
  Document as DocType,
  EMBEDDING_MODELS,
  getCurrentEmbeddingModel,
  setEmbeddingModel,
  reembedAllDocuments,
  DocumentType,
  processDocumentFile,
  getApiKey
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WorkspaceSettings } from './WorkspaceSettings';

export function ChatSidebar() {
  const { chats, activeChatId, startNewChat, switchChat, deleteChat, clearChats, clearAllChats, ragEnabled, setRagEnabled, activeModel } = useChat();
  const { trackActivity } = useUserPreferences();
  const {
    workspaces,
    activeWorkspaceId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace
  } = useWorkspace();
  
  // States for sidebar - enhanced collapsible states
  const [sidebarState, setSidebarState] = useState<'expanded' | 'compact' | 'hidden'>('expanded');
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({});
  
  // States for dialogs
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isEditWorkspaceOpen, setIsEditWorkspaceOpen] = useState(false);
  // States for UI
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  
  
  // States for workspace editing
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  
  // RAG/Document states
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docFilename, setDocFilename] = useState('');
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [currentEmbeddingModel, setCurrentEmbeddingModel] = useState(getCurrentEmbeddingModel());
  const [isReembedding, setIsReembedding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Initialize expanded state for workspaces
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    workspaces.forEach(workspace => {
      // If this is the active workspace, expand it by default
      initialExpandedState[workspace.id] = workspace.id === activeWorkspaceId;
    });
    setExpandedWorkspaces(initialExpandedState);
  }, []);

  const toggleSidebar = () => {
    setSidebarState(state => {
      switch (state) {
        case 'expanded': return 'compact';
        case 'compact': return 'hidden';
        case 'hidden': return 'expanded';
        default: return 'expanded';
      }
    });
  };
  
  const toggleWorkspaceExpanded = (workspaceId: string) => {
    setExpandedWorkspaces(prev => ({
      ...prev,
      [workspaceId]: !prev[workspaceId]
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      const result = await processDocumentFile(file, (progress) => {
        setUploadProgress(10 + progress * 0.8);
      });
      
      setUploadProgress(90);
      
      setDocTitle(result.title);
      setDocFilename(file.name);
      setDocContent(result.content);
      setIsUploadOpen(true);
      setUploadProgress(100);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddDocument = async () => {
    if (docTitle && docContent) {
      try {
        if (!getApiKey()) {
          toast({
            title: "API Key Required",
            description: "Please set your Hugging Face API key in settings before adding documents",
            variant: "destructive"
          });
          setIsUploadOpen(false);
          return;
        }
        
        await addDocumentToStore(docTitle, docContent, docFilename);
        toast({
          title: "Document Added",
          description: `"${docTitle}" has been added to the knowledge base`
        });
        setIsUploadOpen(false);
        setDocTitle('');
        setDocContent('');
        setDocFilename('');
        if (isDocsOpen) {
          loadDocuments();
        }
      } catch (error) {
        console.error('Error adding document:', error);
        const errorMessage = error instanceof Error 
          ? (error.message.includes('Invalid credentials') 
             ? "Invalid API key. Please check your Hugging Face API key in settings." 
             : error.message)
          : "Failed to add document to knowledge base";
          
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };
  
  const loadDocuments = () => {
    const docs = getAllDocuments();
    setDocuments(docs);
  };
  
  const handleDeleteDocument = (docId: string) => {
    try {
      const deleted = deleteDocument(docId);
      if (deleted) {
        toast({
          title: "Document Deleted",
          description: "Document has been removed from the knowledge base"
        });
        loadDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };
  
  const handleChangeEmbeddingModel = async (modelId: string) => {
    try {
      setCurrentEmbeddingModel(setEmbeddingModel(modelId));
      toast({
        title: "Embedding Model Changed",
        description: `Using ${currentEmbeddingModel.name} for document embeddings`
      });
    } catch (error) {
      console.error('Error changing embedding model:', error);
      toast({
        title: "Error",
        description: "Failed to change embedding model",
        variant: "destructive"
      });
    }
  };
  
  const handleReembedDocuments = async () => {
    try {
      setIsReembedding(true);
      await reembedAllDocuments(currentEmbeddingModel.id);
      toast({
        title: "Documents Re-embedded",
        description: `All documents have been re-embedded using ${currentEmbeddingModel.name}`
      });
    } catch (error) {
      console.error('Error re-embedding documents:', error);
      toast({
        title: "Error",
        description: "Failed to re-embed documents",
        variant: "destructive"
      });
    } finally {
      setIsReembedding(false);
    }
  };
  
  const getDocumentTypeIcon = (type: DocumentType) => {
    switch (type) {
      case 'markdown': return 'MD';
      case 'code': return '</>';
      case 'json': return '{}';
      case 'pdf': return 'PDF';
      case 'csv': return 'CSV';
      case 'excel': return 'XLS';
      case 'html': return 'HTML';
      default: return 'TXT';
    }
  };
  
  const getAcceptedFileTypes = () => {
    return ".txt,.md,.json,.js,.ts,.html,.css,.py,.pdf,.csv,.xlsx,.xls,.docx,.doc";
  };

  // Handle create workspace dialog
  const handleCreateWorkspace = () => {
    if (workspaceName.trim()) {
      createWorkspace(workspaceName, workspaceDescription);
      setWorkspaceName('');
      setWorkspaceDescription('');
      setIsCreateWorkspaceOpen(false);
    }
  };

  // Handle edit workspace dialog
  const handleEditWorkspace = () => {
    if (editingWorkspaceId && workspaceName.trim()) {
      updateWorkspace(editingWorkspaceId, {
        name: workspaceName.trim(),
        description: workspaceDescription.trim()
      });
      setIsEditWorkspaceOpen(false);
    }
  };

  // Open edit workspace dialog
  const openEditWorkspaceDialog = (workspace: any) => {
    setEditingWorkspaceId(workspace.id);
    setWorkspaceName(workspace.name);
    setWorkspaceDescription(workspace.description || '');
    setIsEditWorkspaceOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "fixed top-[--header-height] bottom-0 left-0 z-20 flex flex-col bg-card border-r transition-all duration-300",
          sidebarState === 'expanded' && "w-72",
          sidebarState === 'compact' && "w-16",
          sidebarState === 'hidden' && "-translate-x-full",
          isMobile && sidebarState === 'expanded' && "w-full"
        )}
      >
        {/* Sidebar Header - adapts to expanded/compact modes */}
        <div className={cn(
          "flex justify-between items-center border-b",
          sidebarState === 'expanded' ? "p-4" : "p-2 flex-col"
        )}>
          {sidebarState === 'expanded' ? (
            <>
              <h2 className="text-lg font-medium">Workspaces</h2>
              <div className="flex gap-1">
                {ragEnabled && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => { loadDocuments(); setIsDocsOpen(true); }}
                      title="View documents"
                    >
                      <Database className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setIsSettingsOpen(true)}
                      title="RAG settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setIsUploadOpen(true)}
                      title="Add document"
                    >
                      <FilePlus className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={toggleSidebar}
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-2"
                onClick={toggleSidebar}
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {ragEnabled && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 my-1"
                    onClick={() => { loadDocuments(); setIsDocsOpen(true); }}
                    title="View documents"
                  >
                    <Database className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 my-1"
                    onClick={() => setIsSettingsOpen(true)}
                    title="RAG settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              )}
            </>
          )}
        </div>
        
        {/* Only show these elements in expanded mode */}
        {sidebarState === 'expanded' && (
          <>
            <div className="flex gap-2 m-4">
              <Button
                onClick={() => setIsCreateWorkspaceOpen(true)}
                className="gap-2 flex-1"
              >
                <Plus className="h-4 w-4" />
                New Workspace
              </Button>
            </div>
            
            <div className="mx-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">Features</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
            </div>
            
            <div className="mx-4 mb-2">
              <Button
                variant={ragEnabled ? "default" : "outline"}
                size="sm"
                className="w-full flex justify-between items-center"
                onClick={() => setRagEnabled(!ragEnabled)}
              >
                <span>Knowledge Base (RAG)</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  ragEnabled ? "bg-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {ragEnabled ? "On" : "Off"}
                </span>
              </Button>
            </div>
            
            {ragEnabled && (
              <label className="flex items-center gap-2 mx-4 p-2 border rounded-md cursor-pointer hover:bg-accent/10 transition-colors mb-2 relative">
                <FileUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Upload document</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={getAcceptedFileTypes()}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                    <Progress value={uploadProgress} className="w-4/5 h-2 mb-1" />
                    <span className="text-xs text-muted-foreground">Processing...</span>
                  </div>
                )}
              </label>
            )}
          </>
        )}
        
        {sidebarState === 'expanded' ? (
          <ScrollArea className="flex-1 p-4 pt-2">
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="mb-3">
                  <div
                    className={cn(
                      "flex items-center p-2 rounded-md mb-1 transition-all duration-200",
                      workspace.id === activeWorkspaceId
                        ? "bg-gradient-to-r from-cyber-primary/20 to-accent/20 border-l-2 border-cyber-primary"
                        : "hover:bg-accent/30 hover:border-l-2 hover:border-cyber-primary/50",
                      "cursor-pointer"
                    )}
                    onClick={() => switchWorkspace(workspace.id)}
                  >
                    <div className="flex items-center flex-1 overflow-hidden gap-2">
                      <div className={cn(
                        "h-6 w-6 rounded-md flex items-center justify-center",
                        workspace.id === activeWorkspaceId ? "bg-cyber-primary/20" : "bg-secondary/50"
                      )}>
                        <Folder className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          workspace.id === activeWorkspaceId ? "text-cyber-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className={cn(
                        "font-medium truncate transition-colors",
                        workspace.id === activeWorkspaceId ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {workspace.name}
                      </span>
                    </div>
                    
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowWorkspaceSettings(true);
                        }}
                        title="Workspace Settings"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWorkspaceExpanded(workspace.id);
                        }}
                      >
                        {expandedWorkspaces[workspace.id] ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Workspace chats */}
                  {expandedWorkspaces[workspace.id] && (
                    <div className="pl-3 border-l-2 border-border/50 ml-2 space-y-1">
                      {/* New chat button */}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2 px-3 mb-1"
                        onClick={() => {
                          if (workspace.id !== activeWorkspaceId) {
                            switchWorkspace(workspace.id);
                          }
                          startNewChat();
                          if (isMobile) setSidebarState('hidden');
                        }}
                      >
                        <div className="flex w-full items-center gap-2 overflow-hidden">
                          <Plus className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm text-muted-foreground">New Chat</span>
                        </div>
                      </Button>
                      
                      {/* Chat list */}
                      {chats
                        .filter(chat => chat.workspaceId === workspace.id)
                        .map((chat) => (
                          <Button
                            key={chat.id}
                            variant={chat.id === activeChatId ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start text-left h-auto py-2 px-3",
                              chat.id === activeChatId ? "bg-secondary" : ""
                            )}
                            onClick={() => {
                              if (workspace.id !== activeWorkspaceId) {
                                switchWorkspace(workspace.id);
                              }
                              switchChat(chat.id);
                              if (isMobile) setSidebarState('hidden');
                            }}
                          >
                            <div className="flex w-full items-center gap-2 overflow-hidden">
                              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate text-sm">{chat.title}</span>
                              {chat.id === activeChatId && (
                                <div
                                  className="ml-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChat(chat.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 cursor-pointer hover:text-destructive" />
                                </div>
                              )}
                            </div>
                          </Button>
                        ))}
                        
                      {/* Show a message if there are no chats */}
                      {chats.filter(chat => chat.workspaceId === workspace.id).length === 0 && (
                        <div className="text-center py-2 text-sm text-muted-foreground">
                          No chats in this workspace
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex flex-col items-center mt-4">
            {/* Compact workspace icons */}
            {workspaces.map((workspace) => (
              <Button
                key={workspace.id}
                variant="ghost"
                size="icon"
                className={cn(
                  "w-10 h-10 mb-2 rounded-full relative",
                  workspace.id === activeWorkspaceId && "bg-cyber-primary/20"
                )}
                onClick={() => switchWorkspace(workspace.id)}
                title={workspace.name}
              >
                <Folder className={cn(
                  "h-5 w-5",
                  workspace.id === activeWorkspaceId ? "text-cyber-primary" : "text-muted-foreground"
                )} />
                {workspace.id === activeWorkspaceId && (
                  <div className="absolute left-0 h-full w-1 bg-cyber-primary rounded-r-sm" />
                )}
              </Button>
            ))}
            
            {/* New workspace button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 mb-2 rounded-full"
              onClick={() => setIsCreateWorkspaceOpen(true)}
              title="New Workspace"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            {/* New chat button */}
            {activeWorkspaceId && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 mt-4 rounded-full bg-accent/20"
                onClick={() => {
                  startNewChat();
                  if (isMobile) setSidebarState('hidden');
                }}
                title="New Chat"
              >
                <MessageSquare className="h-5 w-5 text-cyber-primary" />
              </Button>
            )}
          </div>
        )}
        
        {/* Personalization components in expanded mode */}
        {sidebarState === 'expanded' && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground px-2">Personalized</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            
            {/* AI-powered prompt suggestions */}
            <CompactPromptSuggestions />
            
            {/* AI-powered model recommendations */}
            <CompactModelRecommendations />
          </div>
        )}
        
        {/* Notes button at bottom of sidebar - different styles for expanded/compact */}
        <div className={cn(
          "border-t",
          sidebarState === 'expanded' ? "pt-2 px-4 pb-4" : "pt-2 pb-4 flex justify-center"
        )}>
          {sidebarState === 'expanded' ? (
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-start"
              onClick={() => setShowNotes(true)}
            >
              <StickyNote className="h-4 w-4" />
              <span>Notes</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full"
              onClick={() => setShowNotes(true)}
              title="Notes"
            >
              <StickyNote className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Notes sheet */}
      <NotesSection isOpen={showNotes} onClose={() => setShowNotes(false)} />
      
      {/* Sidebar toggle button - only shown when sidebar is hidden */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed top-[calc(var(--header-height)+0.75rem)] left-4 z-10 rounded-full shadow-md h-9 w-9",
          "transition-opacity duration-300",
          sidebarState !== 'hidden' && "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
        title="Show sidebar"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Chats?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your conversations across all workspaces will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAllChats();
                setIsConfirmOpen(false);
              }}
            >
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Document to Knowledge Base</DialogTitle>
            <DialogDescription>
              This document will be used for retrieval-augmented generation (RAG).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Content</label>
              <textarea
                className="w-full p-2 border rounded-md h-32"
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Enter or paste document content"
              />
              <p className="text-xs text-muted-foreground">
                From file: {docFilename || "No file selected"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddDocument}
              disabled={!docTitle || !docContent}
            >
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Knowledge Base Settings</DialogTitle>
            <DialogDescription>
              Configure retrieval-augmented generation (RAG) settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Embedding Model</label>
              <Select
                value={currentEmbeddingModel.id}
                onValueChange={handleChangeEmbeddingModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select embedding model" />
                </SelectTrigger>
                <SelectContent>
                  {EMBEDDING_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Current: {currentEmbeddingModel.name} ({currentEmbeddingModel.dimensions} dimensions)
              </p>
            </div>
            
            <Button
              onClick={handleReembedDocuments}
              disabled={isReembedding || getAllDocuments().length === 0}
              variant="outline"
              className="w-full"
            >
              {isReembedding ? "Re-embedding..." : "Re-embed All Documents"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDocsOpen} onOpenChange={setIsDocsOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Knowledge Base Documents</DialogTitle>
            <DialogDescription>
              Manage documents used for retrieval-augmented generation.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-4 py-2">
              {documents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No documents added yet. Upload documents to enhance your AI's knowledge.
                </p>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-6 px-2 font-mono">
                          {getDocumentTypeIcon(doc.type)}
                        </Badge>
                        <h4 className="font-medium">{doc.title}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      {doc.content.substring(0, 100)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="w-full"
            >
              Add New Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Workspace Dialog */}
      <Dialog open={isCreateWorkspaceOpen} onOpenChange={setIsCreateWorkspaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your conversations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="My Workspace"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                placeholder="What is this workspace for?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateWorkspaceOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!workspaceName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Workspace Dialog */}
      <Dialog open={isEditWorkspaceOpen} onOpenChange={setIsEditWorkspaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update your workspace details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Workspace Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description (optional)</Label>
              <Input
                id="editDescription"
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                placeholder="Workspace description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditWorkspaceOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEditWorkspace}
              disabled={!workspaceName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workspace Settings */}
      {showWorkspaceSettings && (
        <div className={cn(
          "fixed inset-0 z-30 bg-background",
          sidebarState === 'hidden' && "hidden"
        )}>
          <WorkspaceSettings onBack={() => setShowWorkspaceSettings(false)} />
        </div>
      )}
    </>
  );
}
