import React, { useState } from 'react';
import { TemplateManager } from '@/components/TemplateManager';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Layers,
  Plus,
  Share2,
  MessageSquare,
  Code,
  FileText,
  Search,
  Filter,
  Folders,
  ListFilter,
  FolderTree
} from 'lucide-react';

export default function TemplatesPage() {
  const { activeWorkspaceId, workspaces } = useWorkspace();
  const [filterView, setFilterView] = useState<'categories' | 'folders'>('categories');
  const [sort, setSort] = useState<'name' | 'date' | 'used'>('date');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  // If no workspace is active, use the first one
  const workspaceId = activeWorkspaceId || workspaces[0]?.id;

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">No Workspace Available</h1>
          <p className="text-muted-foreground">Please create a workspace to manage templates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Create, manage, and share templates for common operations
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select value={sort} onValueChange={(v) => setSort(v as any)}>
              <SelectTrigger className="w-36">
                <div className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="used">Last Used</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button 
                variant={view === 'grid' ? 'default' : 'outline'} 
                size="sm" 
                className="rounded-r-none"
                onClick={() => setView('grid')}
              >
                <Folders className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === 'list' ? 'default' : 'outline'} 
                size="sm" 
                className="rounded-l-none"
                onClick={() => setView('list')}
              >
                <FolderTree className="h-4 w-4" />
              </Button>
            </div>

            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-4">
                  <div className="flex border rounded-md mb-4">
                    <Button 
                      variant={filterView === 'categories' ? 'default' : 'outline'} 
                      size="sm" 
                      className="w-1/2 rounded-r-none"
                      onClick={() => setFilterView('categories')}
                    >
                      Categories
                    </Button>
                    <Button 
                      variant={filterView === 'folders' ? 'default' : 'outline'} 
                      size="sm" 
                      className="w-1/2 rounded-l-none"
                      onClick={() => setFilterView('folders')}
                    >
                      Folders
                    </Button>
                  </div>

                  {filterView === 'categories' ? (
                    <div className="space-y-3">
                      <div className="space-x-2 flex items-center">
                        <input type="checkbox" id="chat-templates" className="rounded" defaultChecked />
                        <Label htmlFor="chat-templates" className="flex items-center gap-1.5 cursor-pointer">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          Chat Templates
                        </Label>
                      </div>
                      
                      <div className="space-x-2 flex items-center">
                        <input type="checkbox" id="code-templates" className="rounded" defaultChecked />
                        <Label htmlFor="code-templates" className="flex items-center gap-1.5 cursor-pointer">
                          <Code className="h-4 w-4 text-green-500" />
                          Code Templates
                        </Label>
                      </div>
                      
                      <div className="space-x-2 flex items-center">
                        <input type="checkbox" id="workflow-templates" className="rounded" defaultChecked />
                        <Label htmlFor="workflow-templates" className="flex items-center gap-1.5 cursor-pointer">
                          <Layers className="h-4 w-4 text-purple-500" />
                          Workflow Templates
                        </Label>
                      </div>
                      
                      <div className="space-x-2 flex items-center">
                        <input type="checkbox" id="document-templates" className="rounded" defaultChecked />
                        <Label htmlFor="document-templates" className="flex items-center gap-1.5 cursor-pointer">
                          <FileText className="h-4 w-4 text-orange-500" />
                          Document Templates
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-x-2 flex items-center">
                        <input type="checkbox" id="personal" className="rounded" defaultChecked />
                        <Label htmlFor="personal" className="cursor-pointer">Personal</Label>
                      </div>
                      <div className="space-x-2 flex items-center">
                        <input type="checkbox" id="shared" className="rounded" defaultChecked />
                        <Label htmlFor="shared" className="cursor-pointer">Shared</Label>
                      </div>
                      <div className="space-x-2 flex items-center">
                        <input type="checkbox" id="favorites" className="rounded" defaultChecked />
                        <Label htmlFor="favorites" className="cursor-pointer">Favorites</Label>
                      </div>
                      <div className="space-x-2 flex items-center">
                        <input type="checkbox" id="archived" className="rounded" />
                        <Label htmlFor="archived" className="cursor-pointer">Archived</Label>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium">Tags</h3>
                  
                  <div className="space-x-2 flex items-center">
                    <input type="checkbox" id="tag-general" className="rounded" defaultChecked />
                    <Label htmlFor="tag-general" className="cursor-pointer">General</Label>
                  </div>
                  
                  <div className="space-x-2 flex items-center">
                    <input type="checkbox" id="tag-development" className="rounded" defaultChecked />
                    <Label htmlFor="tag-development" className="cursor-pointer">Development</Label>
                  </div>
                  
                  <div className="space-x-2 flex items-center">
                    <input type="checkbox" id="tag-rag" className="rounded" defaultChecked />
                    <Label htmlFor="tag-rag" className="cursor-pointer">RAG</Label>
                  </div>
                  
                  <div className="space-x-2 flex items-center">
                    <input type="checkbox" id="tag-knowledge" className="rounded" defaultChecked />
                    <Label htmlFor="tag-knowledge" className="cursor-pointer">Knowledge</Label>
                  </div>
                  
                  <div className="space-x-2 flex items-center">
                    <input type="checkbox" id="tag-qa" className="rounded" defaultChecked />
                    <Label htmlFor="tag-qa" className="cursor-pointer">Q&A</Label>
                  </div>
                  
                  <div className="space-x-2 flex items-center">
                    <input type="checkbox" id="tag-review" className="rounded" defaultChecked />
                    <Label htmlFor="tag-review" className="cursor-pointer">Review</Label>
                  </div>
                </div>

                <Separator />

                <Button variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-3">
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-6">
                <TemplateManager workspaceId={workspaceId} />
              </TabsContent>
              
              <TabsContent value="recent" className="space-y-6">
                <TemplateManager workspaceId={workspaceId} />
              </TabsContent>
              
              <TabsContent value="starred" className="space-y-6">
                <TemplateManager workspaceId={workspaceId} />
              </TabsContent>
              
              <TabsContent value="shared" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Shared Templates</CardTitle>
                    <CardDescription>
                      Templates shared with you by other users
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-10">
                    <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Shared Templates</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      You don't have any templates shared with you yet. When someone shares a template with you, it will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}