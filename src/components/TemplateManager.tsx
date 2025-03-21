import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  FileText,
  MessageSquare,
  Code,
  Layers,
  Trash2,
  Copy,
  Edit,
  Star,
  Clock,
  Tag,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Share2
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'chat' | 'code' | 'workflow' | 'document';
  tags: string[];
  starred: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

interface TemplateManagerProps {
  workspaceId: string;
  defaultCategory?: 'chat' | 'code' | 'workflow' | 'document';
  showFilters?: boolean;
  compact?: boolean;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  workspaceId,
  defaultCategory = 'chat',
  showFilters = true,
  compact = false
}) => {
  const { workspaces, updateWorkspace } = useWorkspace();
  const workspace = workspaces.find(w => w.id === workspaceId);
  const { toast } = useToast();

  // State for templates
  const [templates, setTemplates] = useState<Template[]>(() => {
    return workspace?.settings?.templates || [
      // Sample templates if none exist
      {
        id: crypto.randomUUID(),
        name: 'General Q&A',
        description: 'Template for general question and answer sessions',
        content: 'You are a helpful AI assistant. Answer the following question with accurate and up-to-date information:\n\n{{question}}',
        category: 'chat',
        tags: ['general', 'qa'],
        starred: true,
        createdAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Code Review',
        description: 'Template for reviewing code',
        content: 'Review the following code and suggest improvements:\n\n```{{language}}\n{{code}}\n```',
        category: 'code',
        tags: ['development', 'review'],
        starred: false,
        createdAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'RAG Workflow',
        description: 'Basic workflow for Retrieval Augmented Generation',
        content: 'RAG workflow configuration data',
        category: 'workflow',
        tags: ['rag', 'knowledge'],
        starred: false,
        createdAt: new Date()
      }
    ];
  });

  // UI state
  const [activeCategory, setActiveCategory] = useState<'chat' | 'code' | 'workflow' | 'document'>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: '',
    description: '',
    content: '',
    category: defaultCategory,
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Save templates to workspace settings when they change
  useEffect(() => {
    if (workspace && templates) {
      updateWorkspace(workspaceId, {
        settings: {
          ...workspace.settings,
          templates
        }
      });
    }
  }, [templates, workspaceId, workspace, updateWorkspace]);

  // Filtered templates
  const filteredTemplates = templates.filter(template => {
    // Filter by category
    if (template.category !== activeCategory) return false;
    
    // Filter by search query
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !template.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by tags
    if (filterTags.length > 0 && !filterTags.some(tag => template.tags.includes(tag))) {
      return false;
    }
    
    // Filter by starred
    if (showStarredOnly && !template.starred) return false;
    
    return true;
  });

  // Get all unique tags from templates
  const allTags = Array.from(new Set(templates.flatMap(t => t.tags)));

  // Handle creating a new template
  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) return;
    
    const template: Template = {
      id: crypto.randomUUID(),
      name: newTemplate.name,
      description: newTemplate.description || '',
      content: newTemplate.content,
      category: newTemplate.category || defaultCategory,
      tags: newTemplate.tags || [],
      starred: false,
      createdAt: new Date()
    };
    
    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      description: '',
      content: '',
      category: defaultCategory,
      tags: []
    });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Template Created",
      description: `Template "${template.name}" has been created`,
    });
  };

  // Handle updating a template
  const handleUpdateTemplate = () => {
    if (!selectedTemplate || !selectedTemplate.name || !selectedTemplate.content) return;
    
    setTemplates(prev => prev.map(t => 
      t.id === selectedTemplate.id ? selectedTemplate : t
    ));
    setIsEditDialogOpen(false);
    
    toast({
      title: "Template Updated",
      description: `Template "${selectedTemplate.name}" has been updated`,
    });
  };

  // Handle deleting a template
  const handleDeleteTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    
    setTemplates(prev => prev.filter(t => t.id !== id));
    
    toast({
      title: "Template Deleted",
      description: `Template "${template.name}" has been deleted`,
    });
  };

  // Handle starring a template
  const handleToggleStar = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, starred: !t.starred } : t
    ));
  };

  // Handle adding a tag
  const handleAddTag = (templateTags: string[], tag: string) => {
    if (!tag.trim() || templateTags.includes(tag.trim())) return templateTags;
    return [...templateTags, tag.trim()];
  };

  // Handle removing a tag
  const handleRemoveTag = (templateTags: string[], tag: string) => {
    return templateTags.filter(t => t !== tag);
  };

  // Get icon for category
  const getCategoryIcon = (category: 'chat' | 'code' | 'workflow' | 'document') => {
    switch (category) {
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'workflow': return <Layers className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className={compact ? "border-0 shadow-none" : ""}>
      {!compact && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Template Library
          </CardTitle>
          <CardDescription>
            Create and manage templates for chats, code, documents, and workflows
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
            <TabsList>
              <TabsTrigger value="chat" className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" />
                <span>Code</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                <span>Workflow</span>
              </TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Document</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a new template for {activeCategory === 'chat' ? 'conversations' : 
                    activeCategory === 'code' ? 'code snippets' : 
                    activeCategory === 'workflow' ? 'workflows' : 'documents'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Name</Label>
                  <Input 
                    id="template-name"
                    placeholder="Template name"
                    value={newTemplate.name}
                    onChange={e => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-description">Description</Label>
                  <Input 
                    id="template-description"
                    placeholder="Template description"
                    value={newTemplate.description}
                    onChange={e => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-category">Category</Label>
                  <Select 
                    value={newTemplate.category || defaultCategory} 
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-content">Content</Label>
                  <Textarea 
                    id="template-content"
                    placeholder="Template content with {{variables}}"
                    value={newTemplate.content}
                    onChange={e => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                    className="h-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {`{{variable}}`} syntax for dynamic content that will be replaced when using the template
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add tag"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          setNewTemplate(prev => ({
                            ...prev,
                            tags: handleAddTag(prev.tags || [], tagInput)
                          }));
                          setTagInput('');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        if (tagInput.trim()) {
                          setNewTemplate(prev => ({
                            ...prev,
                            tags: handleAddTag(prev.tags || [], tagInput)
                          }));
                          setTagInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {newTemplate.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button 
                          onClick={() => setNewTemplate(prev => ({
                            ...prev,
                            tags: handleRemoveTag(prev.tags || [], tag)
                          }))}
                          className="ml-1 rounded-full hover:bg-muted w-4 h-4 inline-flex items-center justify-center"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateTemplate}>
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {showFilters && (
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select
              value={filterTags.length > 0 ? 'custom' : 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  setFilterTags([]);
                } else if (value !== 'custom') {
                  setFilterTags([value]);
                }
              }}
            >
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Filter by tag" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                <Separator className="my-1" />
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant={showStarredOnly ? "default" : "outline"}
              size="icon"
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className="h-10 w-10"
            >
              <Star className={`h-4 w-4 ${showStarredOnly ? 'fill-current' : ''}`} />
            </Button>
          </div>
        )}
        
        <ScrollArea className={compact ? "h-[200px]" : "h-[400px]"}>
          {filteredTemplates.length > 0 ? (
            <div className="space-y-2">
              {filteredTemplates.map(template => (
                <div 
                  key={template.id} 
                  className="border rounded-md p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(template.category)}
                        <h3 className="font-medium">{template.name}</h3>
                        {template.starred && (
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleStar(template.id)}
                      >
                        <Star className={`h-4 w-4 ${template.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      
                      <Dialog open={isEditDialogOpen && selectedTemplate?.id === template.id} onOpenChange={(open) => {
                        if (!open) setIsEditDialogOpen(false);
                        else {
                          setSelectedTemplate(template);
                          setIsEditDialogOpen(true);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          <DialogHeader>
                            <DialogTitle>Edit Template</DialogTitle>
                            <DialogDescription>
                              Update the template details
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedTemplate && (
                            <div className="space-y-4 py-2">
                              <div className="space-y-2">
                                <Label htmlFor="edit-template-name">Name</Label>
                                <Input 
                                  id="edit-template-name"
                                  placeholder="Template name"
                                  value={selectedTemplate.name}
                                  onChange={e => setSelectedTemplate(prev => 
                                    prev ? { ...prev, name: e.target.value } : null
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-template-description">Description</Label>
                                <Input 
                                  id="edit-template-description"
                                  placeholder="Template description"
                                  value={selectedTemplate.description}
                                  onChange={e => setSelectedTemplate(prev => 
                                    prev ? { ...prev, description: e.target.value } : null
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-template-content">Content</Label>
                                <Textarea 
                                  id="edit-template-content"
                                  placeholder="Template content with {{variables}}"
                                  value={selectedTemplate.content}
                                  onChange={e => setSelectedTemplate(prev => 
                                    prev ? { ...prev, content: e.target.value } : null
                                  )}
                                  className="h-32"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="Add tag"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' && tagInput.trim()) {
                                        setSelectedTemplate(prev => 
                                          prev ? {
                                            ...prev,
                                            tags: handleAddTag(prev.tags, tagInput)
                                          } : null
                                        );
                                        setTagInput('');
                                      }
                                    }}
                                  />
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => {
                                      if (tagInput.trim() && selectedTemplate) {
                                        setSelectedTemplate({
                                          ...selectedTemplate,
                                          tags: handleAddTag(selectedTemplate.tags, tagInput)
                                        });
                                        setTagInput('');
                                      }
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                                
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {selectedTemplate.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                      {tag}
                                      <button 
                                        onClick={() => setSelectedTemplate(prev => 
                                          prev ? {
                                            ...prev,
                                            tags: handleRemoveTag(prev.tags, tag)
                                          } : null
                                        )}
                                        className="ml-1 rounded-full hover:bg-muted w-4 h-4 inline-flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              onClick={() => {
                                if (selectedTemplate) {
                                  handleDeleteTemplate(selectedTemplate.id);
                                  setIsEditDialogOpen(false);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="button" onClick={handleUpdateTemplate}>
                                Save Changes
                              </Button>
                            </div>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          // Logic to use the template would go here
                          toast({
                            title: "Template Used",
                            description: `Template "${template.name}" has been applied`,
                          });
                          
                          // Update last used date
                          setTemplates(prev => prev.map(t => 
                            t.id === template.id ? { ...t, lastUsed: new Date() } : t
                          ));
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.lastUsed ? (
                        <span>Last used {new Date(template.lastUsed).toLocaleDateString()}</span>
                      ) : (
                        <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                        <Share2 className="h-3 w-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
              <Layers className="h-10 w-10 mb-2 opacity-40" />
              <p>No templates found for this category</p>
              <Button 
                variant="link" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterTags([]);
                  setShowStarredOnly(false);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      {!compact && (
        <CardFooter className="border-t pt-4 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-1.5">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};