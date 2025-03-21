import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FolderOpen, 
  Settings, 
  Trash2, 
  PlusCircle, 
  FolderArchive, 
  Download, 
  Upload, 
  Search,
  Tag,
  Star,
  Folder,
  LayoutGrid,
  SlidersHorizontal
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';
import { AgentConfiguration } from '@/components/AgentConfiguration';
import { AVAILABLE_MODELS, HuggingFaceModel } from '@/lib/api';
import { WorkspaceSettings } from '@/components/WorkspaceSettings';

// Define workspace template options
const WORKSPACE_TEMPLATES = [
  { id: 'blank', name: 'Blank Workspace', description: 'Start with a clean workspace' },
  { id: 'research', name: 'Research Assistant', description: 'Optimized for research and information gathering' },
  { id: 'creative', name: 'Creative Writing', description: 'Focused on creative tasks and content generation' },
  { id: 'coding', name: 'Code Assistant', description: 'Configured for programming and development tasks' },
  { id: 'business', name: 'Business Helper', description: 'Set up for business communication and analysis' }
];

export function WorkspaceSelector() {
  const { 
    workspaces,
    activeWorkspaceId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
    clearAllWorkspaces
  } = useWorkspace();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [newWorkspaceTemplate, setNewWorkspaceTemplate] = useState('blank');
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [editWorkspaceDescription, setEditWorkspaceDescription] = useState('');
  const [editWorkspaceTags, setEditWorkspaceTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editTab, setEditTab] = useState('general');
  const [selectedLLMModel, setSelectedLLMModel] = useState<HuggingFaceModel>(AVAILABLE_MODELS[0]);
  
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  
  // Filter workspaces by search query
  const filteredWorkspaces = searchQuery 
    ? workspaces.filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : workspaces;
  
  // Group workspaces by first letter for organization
  const groupedWorkspaces = filteredWorkspaces.reduce((acc, workspace) => {
    const firstChar = workspace.name.charAt(0).toUpperCase();
    if (!acc[firstChar]) {
      acc[firstChar] = [];
    }
    acc[firstChar].push(workspace);
    return acc;
  }, {} as Record<string, typeof workspaces>);
  
  // Sort keys alphabetically
  const sortedKeys = Object.keys(groupedWorkspaces).sort();
  
  // Handle create workspace
  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      // Apply template settings based on selection
      let templateConfig = {};
      if (newWorkspaceTemplate !== 'blank') {
        // This would contain template-specific settings
        templateConfig = getTemplateConfig(newWorkspaceTemplate);
      }
      
      createWorkspace(
        newWorkspaceName.trim(), 
        newWorkspaceDescription.trim(),
        // Default icon based on template
        getTemplateIcon(newWorkspaceTemplate),
        // Default color based on template
        getTemplateColor(newWorkspaceTemplate)
      );
      
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      setNewWorkspaceTemplate('blank');
      setIsCreateDialogOpen(false);
    }
  };
  
  // Get template-specific configuration
  const getTemplateConfig = (templateId: string) => {
    switch(templateId) {
      case 'research':
        return { 
          ragEnabled: true,
          webSearchEnabled: true,
          model: AVAILABLE_MODELS.find(m => m.id.includes('mistral')) || AVAILABLE_MODELS[0]
        };
      case 'creative':
        return {
          temperature: 0.9,
          model: AVAILABLE_MODELS.find(m => m.id.includes('llama')) || AVAILABLE_MODELS[0]
        };
      case 'coding':
        return {
          model: AVAILABLE_MODELS.find(m => m.id.includes('codellama')) || AVAILABLE_MODELS[0]
        };
      case 'business':
        return {
          tone: 'professional',
          model: AVAILABLE_MODELS.find(m => m.id.includes('mistral')) || AVAILABLE_MODELS[0]
        };
      default:
        return {};
    }
  };
  
  // Get template-specific icon
  const getTemplateIcon = (templateId: string) => {
    switch(templateId) {
      case 'research': return 'search';
      case 'creative': return 'pencil';
      case 'coding': return 'code';
      case 'business': return 'briefcase';
      default: return 'folder';
    }
  };
  
  // Get template-specific color
  const getTemplateColor = (templateId: string) => {
    switch(templateId) {
      case 'research': return '#3b82f6'; // blue
      case 'creative': return '#8b5cf6'; // purple
      case 'coding': return '#10b981'; // green
      case 'business': return '#f59e0b'; // amber
      default: return '#6b7280'; // gray
    }
  };
  
  // Handle edit workspace
  const handleEditWorkspace = () => {
    if (activeWorkspaceId && editWorkspaceName.trim()) {
      // Parse tags from comma-separated string
      const tags = editWorkspaceTags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      updateWorkspace(activeWorkspaceId, {
        name: editWorkspaceName.trim(),
        description: editWorkspaceDescription.trim(),
        tags: tags,
        llmConfig: {
          model: selectedLLMModel.id,
          // Add other LLM configs here
        }
      });
      
      setIsEditDialogOpen(false);
    }
  };
  
  // Open edit dialog with current workspace data
  const openEditDialog = () => {
    if (activeWorkspace) {
      setEditWorkspaceName(activeWorkspace.name);
      setEditWorkspaceDescription(activeWorkspace.description || '');
      setEditWorkspaceTags(activeWorkspace.tags?.join(', ') || '');
      
      // Set selected model based on workspace config or default
      if (activeWorkspace.llmConfig?.model) {
        const model = AVAILABLE_MODELS.find(m => m.id === activeWorkspace.llmConfig.model);
        if (model) setSelectedLLMModel(model);
      } else {
        setSelectedLLMModel(AVAILABLE_MODELS[0]);
      }
      
      setEditTab('general');
      setIsEditDialogOpen(true);
    }
  };
  
  // Handle importing workspace
  const handleImportWorkspace = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const workspace = JSON.parse(event.target?.result as string);
            if (workspace.name && typeof workspace.name === 'string') {
              createWorkspace(
                workspace.name,
                workspace.description,
                workspace.icon,
                workspace.color
              );
            }
          } catch (error) {
            console.error('Error importing workspace:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  // Handle exporting workspace
  const handleExportWorkspace = () => {
    if (!activeWorkspace) return;
    
    const workspaceData = JSON.stringify(activeWorkspace, null, 2);
    const blob = new Blob([workspaceData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeWorkspace.name.replace(/\s+/g, '_')}_workspace.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center justify-start w-full px-3 text-base font-medium group"
          >
            <div className="flex items-center gap-2 w-full">
              <div 
                className={cn(
                  "w-4 h-4 rounded-sm flex items-center justify-center",
                  activeWorkspace?.color ? undefined : "bg-muted-foreground/20"
                )}
                style={activeWorkspace?.color ? { backgroundColor: activeWorkspace.color } : undefined}
              >
                <FolderOpen className="h-3 w-3 text-white" />
              </div>
              <span className="truncate flex-1">
                {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
              </span>
              <SlidersHorizontal className="h-3.5 w-3.5 ml-2 opacity-60 group-hover:opacity-100" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 max-h-[80vh] overflow-auto">
          <div className="px-2 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workspaces..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Workspaces</span>
            <span className="text-xs text-muted-foreground">{workspaces.length}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {filteredWorkspaces.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No workspaces found
            </div>
          ) : (
            <>
              {/* Favorite/Pinned Workspaces */}
              {filteredWorkspaces.some(w => w.pinned) && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3 w-3" />
                        <span>Pinned</span>
                      </div>
                    </DropdownMenuLabel>
                    {filteredWorkspaces
                      .filter(w => w.pinned)
                      .map(workspace => (
                        <DropdownMenuItem 
                          key={workspace.id}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer pl-6",
                            workspace.id === activeWorkspaceId && "bg-accent"
                          )}
                          onClick={() => switchWorkspace(workspace.id)}
                        >
                          <div 
                            className={cn(
                              "w-3 h-3 rounded-sm flex items-center justify-center",
                              workspace.color ? undefined : "bg-muted-foreground/20"
                            )}
                            style={workspace.color ? { backgroundColor: workspace.color } : undefined}
                          >
                          </div>
                          <span className="truncate flex-1">{workspace.name}</span>
                        </DropdownMenuItem>
                      ))
                    }
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {/* Recent Workspaces */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="h-3 w-3" />
                    <span>Recent</span>
                  </div>
                </DropdownMenuLabel>
                {filteredWorkspaces
                  .slice(0, 5)
                  .map(workspace => (
                    <DropdownMenuItem 
                      key={workspace.id}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer pl-6",
                        workspace.id === activeWorkspaceId && "bg-accent"
                      )}
                      onClick={() => switchWorkspace(workspace.id)}
                    >
                      <div 
                        className={cn(
                          "w-3 h-3 rounded-sm flex items-center justify-center",
                          workspace.color ? undefined : "bg-muted-foreground/20"
                        )}
                        style={workspace.color ? { backgroundColor: workspace.color } : undefined}
                      >
                      </div>
                      <span className="truncate flex-1">{workspace.name}</span>
                    </DropdownMenuItem>
                  ))
                }
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              
              {/* All Workspaces (Alphabetical) */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4" />
                    <span>All Workspaces</span>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-[50vh] overflow-auto w-64">
                    {sortedKeys.map((key) => (
                      <React.Fragment key={key}>
                        <DropdownMenuLabel className="text-xs text-muted-foreground">{key}</DropdownMenuLabel>
                        {groupedWorkspaces[key].map(workspace => (
                          <DropdownMenuItem 
                            key={workspace.id}
                            className={cn(
                              "flex items-center gap-2 cursor-pointer pl-6",
                              workspace.id === activeWorkspaceId && "bg-accent"
                            )}
                            onClick={() => switchWorkspace(workspace.id)}
                          >
                            <div 
                              className={cn(
                                "w-3 h-3 rounded-sm flex items-center justify-center",
                                workspace.color ? undefined : "bg-muted-foreground/20"
                              )}
                              style={workspace.color ? { backgroundColor: workspace.color } : undefined}
                            >
                            </div>
                            <span className="truncate flex-1">{workspace.name}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </React.Fragment>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </>
          )}
          
          <DropdownMenuSeparator />
          
          {/* Action Buttons */}
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Workspace</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleImportWorkspace}
          >
            <Upload className="h-4 w-4" />
            <span>Import Workspace</span>
          </DropdownMenuItem>
          
          {activeWorkspace && (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={openEditDialog}
              >
                <Settings className="h-4 w-4" />
                <span>Edit Workspace</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsSettingsDialogOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Advanced Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleExportWorkspace}
              >
                <Download className="h-4 w-4" />
                <span>Export Workspace</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-red-500"
                onClick={() => deleteWorkspace(activeWorkspaceId)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Workspace</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-red-500 font-semibold"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear ALL workspaces? This cannot be undone.")) {
                    clearAllWorkspaces();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Workspaces</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Create Workspace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your conversations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="workspaceName">Name</Label>
              <Input
                id="workspaceName"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="My Workspace"
                className="w-full"
              />
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="workspaceDescription">Description (optional)</Label>
              <Textarea
                id="workspaceDescription"
                value={newWorkspaceDescription}
                onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                placeholder="What is this workspace for?"
                className="w-full resize-none h-20"
              />
            </div>
            
            <div className="grid gap-3">
              <Label>Template</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WORKSPACE_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className={cn(
                      "flex flex-col border rounded-md p-3 cursor-pointer hover:border-primary transition-colors",
                      newWorkspaceTemplate === template.id ? "border-primary bg-primary/5" : "border-border"
                    )}
                    onClick={() => setNewWorkspaceTemplate(template.id)}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{template.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}>
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Workspace Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update your workspace settings and configurations.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={editTab} onValueChange={setEditTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="model">Model Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="editWorkspaceName">Name</Label>
                <Input
                  id="editWorkspaceName"
                  value={editWorkspaceName}
                  onChange={(e) => setEditWorkspaceName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="editWorkspaceDescription">Description (optional)</Label>
                <Textarea
                  id="editWorkspaceDescription"
                  value={editWorkspaceDescription}
                  onChange={(e) => setEditWorkspaceDescription(e.target.value)}
                  className="w-full resize-none h-20"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="editWorkspaceTags">Tags (comma separated)</Label>
                <Input
                  id="editWorkspaceTags"
                  value={editWorkspaceTags}
                  onChange={(e) => setEditWorkspaceTags(e.target.value)}
                  placeholder="work, research, personal"
                  className="w-full"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="model" className="space-y-4 py-4">
              <div className="grid gap-3">
                <Label>Default Model</Label>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABLE_MODELS.map(model => (
                    <div
                      key={model.id}
                      className={cn(
                        "flex items-center justify-between border rounded-md p-3 cursor-pointer hover:border-primary transition-colors",
                        selectedLLMModel.id === model.id ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => setSelectedLLMModel(model)}
                    >
                      <div className="flex flex-col">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">{model.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 py-4">
              <AgentConfiguration
                initialConfig={activeWorkspace?.agentConfig}
                onConfigChange={(config) => {
                  if (activeWorkspaceId) {
                    updateWorkspace(activeWorkspaceId, { agentConfig: config });
                  }
                }}
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditWorkspace} disabled={!editWorkspaceName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Advanced Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Workspace Advanced Settings</DialogTitle>
            <DialogDescription>
              Configure advanced settings and integrations for this workspace
            </DialogDescription>
          </DialogHeader>
          
          {activeWorkspace && (
            <WorkspaceSettings
              workspaceId={activeWorkspace.id}
              onClose={() => setIsSettingsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
