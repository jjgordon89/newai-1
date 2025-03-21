import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Settings,
  Workflow,
  Play,
  Clock,
  Star,
  BarChart,
  ChevronRight,
  Search,
  Brain,
  MessageSquare,
  Globe,
  FileText,
  Database,
  LayoutDashboard,
  Filter,
  Rocket
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowCanvasWithProvider } from './WorkflowCanvas';
import { useWorkflow } from '@/context/WorkflowContext';
import { cn } from '@/lib/utils';

// Quick template definitions for recommended workflows
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  complexity: 'simple' | 'medium' | 'advanced';
}

const recommendedTemplates: WorkflowTemplate[] = [
  {
    id: 'template-1',
    name: 'Document QA Agent',
    description: 'Build an agent that can answer questions about your documents',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    category: 'document-processing',
    complexity: 'simple'
  },
  {
    id: 'template-2',
    name: 'Web Research Agent',
    description: 'Agent that searches the web and summarizes findings',
    icon: <Globe className="h-4 w-4 text-green-500" />,
    category: 'research',
    complexity: 'medium'
  },
  {
    id: 'template-3',
    name: 'Multi-step Reasoning',
    description: 'Chain of thought reasoning with multi-step processing',
    icon: <Brain className="h-4 w-4 text-purple-500" />,
    category: 'reasoning',
    complexity: 'advanced'
  },
  {
    id: 'template-4',
    name: 'Customer Support Bot',
    description: 'Automated customer service with knowledge base integration',
    icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
    category: 'customer-support',
    complexity: 'medium'
  }
];

export const MiniWorkflowBuilder: React.FC = () => {
  const { workflows, templates, createWorkflow, setActiveWorkflowId } = useWorkflow();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<string>('all');
  
  // Get recent workflows
  const recentWorkflows = [...workflows]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  // Get the last created/edited workflow
  const latestWorkflow = workflows.length > 0
    ? workflows.reduce((latest, current) =>
        new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
      )
    : null;
  
  // Filter workflows based on search and filter
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = searchQuery === '' ||
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workflow.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    
    // Additional filters could be implemented here
    // For example, filtering by node types, creation date, etc.
    return matchesSearch;
  });
  
  // Calculate workflow stats
  const workflowStats = {
    total: workflows.length,
    active: workflows.filter(w => w.nodes.length > 0).length,
    withRag: workflows.filter(w => w.nodes.some(n => n.type === 'rag')).length,
    withLLM: workflows.filter(w => w.nodes.some(n => n.type === 'llm')).length
  };
  
  // Handle creating a workflow from template
  const handleUseTemplate = (templateId: string, templateName: string, templateDescription: string) => {
    const newWorkflow = createWorkflow(templateName, templateDescription, templateId);
    setActiveWorkflowId(newWorkflow.id);
    // Note: This would navigate to the workflow editor in the parent component
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            AI Workflow Builder
          </h2>
          <p className="text-muted-foreground mt-1">
            Create automated AI workflows with drag-and-drop visual design
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-1">
            <Link to="/workflow-builder/settings">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild className="gap-1">
            <Link to="/workflow-builder">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Workflow</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Workflow Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Total Workflows</p>
              <p className="text-2xl font-bold">{workflowStats.total}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Workflow className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-900/10">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Active Agents</p>
              <p className="text-2xl font-bold">{workflowStats.active}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Play className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">RAG Workflows</p>
              <p className="text-2xl font-bold">{workflowStats.withRag}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Database className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 dark:bg-purple-900/10">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">AI-powered</p>
              <p className="text-2xl font-bold">{workflowStats.withLLM}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="my-workflows">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-workflows">My Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
        </TabsList>
        
        {/* My Workflows Tab */}
        <TabsContent value="my-workflows" className="space-y-4 mt-6">
          {/* Search and filter */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {workflows.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Create Your First Workflow</CardTitle>
                <CardDescription>
                  Get started by creating a new workflow or using a template
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[200px] border-y flex items-center justify-center">
                  <div className="text-center">
                    <Workflow className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No workflows created yet</p>
                    <div className="flex justify-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/workflow-builder?template=true">
                          <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                          Use Template
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link to="/workflow-builder">
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          Create New
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Latest workflow preview */}
              {latestWorkflow && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Recently Edited</span>
                  </h3>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{latestWorkflow.name}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            {latestWorkflow.description || 'No description'}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900/20">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(latestWorkflow.updatedAt))}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            "bg-blue-50 text-blue-700 dark:bg-blue-900/20",
                            latestWorkflow.nodes.length === 0 && "bg-amber-50 text-amber-700 dark:bg-amber-900/20"
                          )}>
                            {latestWorkflow.nodes.length === 0 ? 'Draft' : 'Active'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[200px] border-y relative">
                        <WorkflowCanvasWithProvider
                          initialNodes={latestWorkflow.nodes}
                          initialEdges={latestWorkflow.edges}
                          readOnly={true}
                          showControls={false}
                          showMiniMap={false}
                        />
                        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-1 rounded">
                          {latestWorkflow.nodes.length} nodes • {latestWorkflow.edges.length} connections
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 justify-between pt-3 pb-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className="flex -space-x-1">
                          {latestWorkflow.nodes.some(n => n.type === 'rag') && (
                            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                              <Database className="h-3 w-3 text-blue-500" />
                            </div>
                          )}
                          {latestWorkflow.nodes.some(n => n.type === 'llm') && (
                            <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                              <Brain className="h-3 w-3 text-purple-500" />
                            </div>
                          )}
                          {latestWorkflow.nodes.some(n => n.type === 'web-search') && (
                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                              <Globe className="h-3 w-3 text-green-500" />
                            </div>
                          )}
                        </div>
                        <span>
                          {[
                            latestWorkflow.nodes.some(n => n.type === 'rag') && 'RAG',
                            latestWorkflow.nodes.some(n => n.type === 'llm') && 'LLM',
                            latestWorkflow.nodes.some(n => n.type === 'web-search') && 'Web'
                          ].filter(Boolean).join(' • ')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/workflow-builder/${latestWorkflow.id}/run`}>
                            <Play className="h-3.5 w-3.5 mr-1" />
                            Run
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link to={`/workflow-builder/${latestWorkflow.id}`}>
                            Edit Workflow
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              )}
              
              {/* Workflow list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkflows.map(workflow => (
                  <Link
                    key={workflow.id}
                    to={`/workflow-builder/${workflow.id}`}
                    className="block h-full"
                  >
                    <Card className="cursor-pointer h-full hover:border-primary transition-colors flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{workflow.name}</CardTitle>
                          <div className="flex gap-1">
                            <Badge
                              variant="outline"
                              className={
                                workflow.nodes.length > 0
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/20"
                              }
                            >
                              {workflow.nodes.length > 0 ? 'Active' : 'Draft'}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-1">
                          {workflow.description || 'No description'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 flex-1">
                        <div className="h-[100px] border-y relative">
                          <WorkflowCanvasWithProvider
                            initialNodes={workflow.nodes}
                            initialEdges={workflow.edges}
                            readOnly={true}
                            showControls={false}
                            showMiniMap={false}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3 pb-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(workflow.updatedAt))} ago
                        </div>
                        <div className="flex items-center text-xs">
                          <span>{workflow.nodes.length} nodes</span>
                          <span className="mx-1">•</span>
                          <span>{workflow.edges.length} connections</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
                
                {/* Create New Card */}
                <Link to="/workflow-builder" className="block h-full">
                  <Card className="cursor-pointer h-full border-dashed hover:border-primary transition-colors flex flex-col items-center justify-center p-6">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <PlusCircle className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-base font-medium mb-2">Create New Workflow</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start building a custom workflow from scratch
                      </p>
                      <Button size="sm">
                        Create Workflow
                      </Button>
                    </div>
                  </Card>
                </Link>
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Workflow Templates</h3>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filter
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedTemplates.map(template => (
              <Card key={template.id} className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        template.complexity === 'simple' && "bg-green-100",
                        template.complexity === 'medium' && "bg-amber-100",
                        template.complexity === 'advanced' && "bg-purple-100"
                      )}>
                        {template.icon}
                      </div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className={cn(
                      template.complexity === 'simple' && "bg-green-50 text-green-700",
                      template.complexity === 'medium' && "bg-amber-50 text-amber-700",
                      template.complexity === 'advanced' && "bg-purple-50 text-purple-700"
                    )}>
                      {template.complexity}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 my-2">
                    {template.category === 'document-processing' && (
                      <>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">RAG</Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Documents</Badge>
                      </>
                    )}
                    {template.category === 'research' && (
                      <>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">LLM</Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Web Search</Badge>
                      </>
                    )}
                    {template.category === 'reasoning' && (
                      <>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">LLM</Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">Reasoning</Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Branching</Badge>
                      </>
                    )}
                    {template.category === 'customer-support' && (
                      <>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">LLM</Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">RAG</Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">Dialog</Badge>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-0">
                  <Button size="sm" onClick={() => handleUseTemplate(template.id, template.name, template.description)}>
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Explore Workflows</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Star className="h-3.5 w-3.5 mr-1" />
                Popular
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Recent
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Community Hub</CardTitle>
                      <CardDescription>Coming Soon</CardDescription>
                    </div>
                  </div>
                  <Badge>Preview</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Browse and share workflow templates with the community. Discover pre-built solutions and inspiration for your projects.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" disabled>Join Waitlist</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};