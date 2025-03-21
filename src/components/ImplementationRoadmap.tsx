import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  knowledgeManagementRoadmap,
  Phase,
  Task,
  getNextTasks,
  calculateCompletionDate,
} from "@/lib/implementationRoadmap";

const ImplementationRoadmap: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);

  // Calculate progress
  const totalTasks = knowledgeManagementRoadmap.phases.reduce(
    (sum, phase) => sum + phase.tasks.length,
    0,
  );

  const completedTasks = knowledgeManagementRoadmap.phases.reduce(
    (sum, phase) =>
      sum + phase.tasks.filter((task) => task.status === "completed").length,
    0,
  );

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Get next tasks to work on
  const nextTasks = getNextTasks(knowledgeManagementRoadmap);

  // Calculate estimated completion date
  const startDate = new Date();
  const teamSize = 2; // Assuming 2 team members
  const estimatedCompletionDate = calculateCompletionDate(
    knowledgeManagementRoadmap,
    startDate,
    teamSize,
  );

  const togglePhaseExpansion = (phaseId: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId)
        ? prev.filter((id) => id !== phaseId)
        : [...prev, phaseId],
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "not-started":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const renderTask = (task: Task) => (
    <div key={task.id} className="p-4 border rounded-md mb-2 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Checkbox id={task.id} disabled />
            <h4 className="font-medium">{task.name}</h4>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {task.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            <Badge className={getStatusColor(task.status)}>
              {task.status === "not-started"
                ? "Not Started"
                : task.status === "in-progress"
                  ? "In Progress"
                  : "Completed"}
            </Badge>
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>
            {task.estimatedDays} day{task.estimatedDays !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      {task.dependencies.length > 0 && (
        <div className="mt-3 text-sm">
          <span className="text-muted-foreground">Dependencies: </span>
          {task.dependencies.map((depId, index) => (
            <span key={depId}>
              {depId}
              {index < task.dependencies.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderPhase = (phase: Phase) => {
    const isExpanded = expandedPhases.includes(phase.id);
    const phaseCompletedTasks = phase.tasks.filter(
      (task) => task.status === "completed",
    ).length;
    const phaseProgress =
      phase.tasks.length > 0
        ? (phaseCompletedTasks / phase.tasks.length) * 100
        : 0;

    return (
      <Card key={phase.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 mr-1 h-6 w-6"
                  onClick={() => togglePhaseExpansion(phase.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                {phase.name}
              </CardTitle>
              <CardDescription>{phase.description}</CardDescription>
            </div>
            <Badge className={getStatusColor(phase.status)}>
              {phase.status === "not-started"
                ? "Not Started"
                : phase.status === "in-progress"
                  ? "In Progress"
                  : "Completed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(phaseProgress)}%</span>
            </div>
            <Progress value={phaseProgress} className="h-2" />
          </div>

          {isExpanded && (
            <div className="space-y-2">
              {phase.tasks.map((task) => renderTask(task))}
            </div>
          )}

          {!isExpanded && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{phase.tasks.length} tasks</span>
              <span>{phaseCompletedTasks} completed</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Implementation Roadmap</h1>
        <Button>Update Progress</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phases">Phases & Tasks</TabsTrigger>
          <TabsTrigger value="next">Next Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(progress)}%
                </div>
                <div className="mt-2">
                  <Progress value={progress} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    Start: {startDate.toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    Estimated completion:{" "}
                    {estimatedCompletionDate.toLocaleDateString()}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on {teamSize} team members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Phase Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {knowledgeManagementRoadmap.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{phase.name}</span>
                      <Badge className={getStatusColor(phase.status)}>
                        {phase.status === "not-started"
                          ? "Not Started"
                          : phase.status === "in-progress"
                            ? "In Progress"
                            : "Completed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Critical Path</CardTitle>
              <CardDescription>
                These tasks are critical for the project timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {knowledgeManagementRoadmap.phases
                  .flatMap((phase) =>
                    phase.tasks.filter((task) => task.priority === "critical"),
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {task.description}
                        </div>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status === "not-started"
                          ? "Not Started"
                          : task.status === "in-progress"
                            ? "In Progress"
                            : "Completed"}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4 pt-4">
          {knowledgeManagementRoadmap.phases.map((phase) => renderPhase(phase))}
        </TabsContent>

        <TabsContent value="next" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Next Tasks</CardTitle>
              <CardDescription>
                These tasks are ready to be worked on based on dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nextTasks.length > 0 ? (
                <div className="space-y-2">
                  {nextTasks.map((task) => renderTask(task))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p>
                    All tasks are either completed or blocked by dependencies.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Risks</CardTitle>
              <CardDescription>
                Potential risks that could impact the implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-md bg-red-50">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">
                        Performance issues with large document collections
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        Large document collections may cause performance issues
                        with vector search and document processing.
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="text-red-700 border-red-300"
                        >
                          High Risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-md bg-orange-50">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800">
                        Integration challenges with external APIs
                      </h4>
                      <p className="text-sm text-orange-700 mt-1">
                        External APIs may have rate limits, authentication
                        issues, or unexpected changes.
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="text-orange-700 border-orange-300"
                        >
                          Medium Risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-md bg-blue-50">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">
                        Security concerns with sensitive documents
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Handling sensitive documents requires proper security
                        measures and access controls.
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="text-blue-700 border-blue-300"
                        >
                          Medium Risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImplementationRoadmap;
