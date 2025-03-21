import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  ChevronRight,
  Clock,
  Cloud,
  Code,
  Copy,
  Database,
  Download,
  FileText,
  Github,
  HardDrive,
  History,
  Info,
  Layers,
  Loader2,
  Package,
  RefreshCw,
  Rocket,
  Save,
  Server,
  Settings,
  Shield,
  Terminal,
  Upload,
  XCircle,
} from "lucide-react";
import deploymentUtils, {
  DeploymentConfig,
  SystemHealthStatus,
  BackupConfig,
} from "@/lib/deploymentUtils";

export default function DeploymentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [deploymentConfig, setDeploymentConfig] =
    useState<DeploymentConfig | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus | null>(
    null,
  );
  const [backups, setBackups] = useState<BackupConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentDocs, setDeploymentDocs] = useState("");
  const [cicdConfig, setCicdConfig] = useState<Record<string, any> | null>(
    null,
  );
  const [k8sManifest, setK8sManifest] = useState<Record<string, any> | null>(
    null,
  );

  // Initialize deployment utils with default config
  useEffect(() => {
    const defaultConfig: DeploymentConfig = {
      environment: "development",
      version: "1.0.0",
      buildId: `build-${Date.now()}`,
      deploymentDate: new Date().toISOString(),
      features: {
        ragEnabled: true,
        webSearchEnabled: true,
        documentProcessingEnabled: true,
        apiIntegrationsEnabled: true,
        workflowsEnabled: true,
      },
      scaling: {
        minInstances: 2,
        maxInstances: 5,
        cpuThreshold: 70,
        memoryThreshold: 80,
      },
      monitoring: {
        loggingLevel: "info",
        metricsEnabled: true,
        alertingEnabled: true,
      },
      security: {
        authEnabled: true,
        apiKeyRequired: true,
        rateLimiting: true,
        requestsPerMinute: 100,
      },
      backup: {
        enabled: true,
        frequency: "daily",
        retentionDays: 30,
      },
    };

    deploymentUtils.initialize(defaultConfig);
    setDeploymentConfig(defaultConfig);

    // Generate deployment docs
    setDeploymentDocs(deploymentUtils.generateDeploymentDocs());

    // Generate CI/CD config
    setCicdConfig(deploymentUtils.generateCiCdConfig());

    // Generate K8s manifest
    setK8sManifest(deploymentUtils.generateK8sManifest());

    // Load system health
    loadSystemHealth();

    // Load backups
    loadBackups();
  }, []);

  // Load system health
  const loadSystemHealth = async () => {
    try {
      const health = await deploymentUtils.checkHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error("Error loading system health:", error);
    }
  };

  // Load backups
  const loadBackups = async () => {
    try {
      const backupsList = await deploymentUtils.listBackups();
      setBackups(backupsList);
    } catch (error) {
      console.error("Error loading backups:", error);
    }
  };

  // Update deployment config
  const updateConfig = (updates: Partial<DeploymentConfig>) => {
    const updatedConfig = deploymentUtils.updateConfig(updates);
    if (updatedConfig) {
      setDeploymentConfig(updatedConfig);

      // Regenerate deployment docs
      setDeploymentDocs(deploymentUtils.generateDeploymentDocs());

      // Regenerate CI/CD config
      setCicdConfig(deploymentUtils.generateCiCdConfig());

      // Regenerate K8s manifest
      setK8sManifest(deploymentUtils.generateK8sManifest());
    }
  };

  // Create a new backup
  const createBackup = async () => {
    setIsLoading(true);
    try {
      await deploymentUtils.createBackup();
      await loadBackups();
    } catch (error) {
      console.error("Error creating backup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Restore from backup
  const restoreFromBackup = async (backupId: string) => {
    setIsLoading(true);
    try {
      await deploymentUtils.restoreFromBackup(backupId);
      await loadSystemHealth();
    } catch (error) {
      console.error("Error restoring from backup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format bytes to human-readable size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Render system health status
  const renderHealthStatus = () => {
    if (!systemHealth) return null;

    const statusColors = {
      healthy: "text-green-500",
      degraded: "text-amber-500",
      unhealthy: "text-red-500",
    };

    const componentStatusColors = {
      operational: "text-green-500",
      degraded: "text-amber-500",
      down: "text-red-500",
    };

    const statusIcons = {
      healthy: <CheckCircle className="h-5 w-5 text-green-500" />,
      degraded: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      unhealthy: <XCircle className="h-5 w-5 text-red-500" />,
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {statusIcons[systemHealth.status]}
            <h2
              className={`text-xl font-bold ${statusColors[systemHealth.status]}`}
            >
              System Status:{" "}
              {systemHealth.status.charAt(0).toUpperCase() +
                systemHealth.status.slice(1)}
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={loadSystemHealth}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth.environment}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Version: {systemHealth.version}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(systemHealth.uptime / 86400)}d{" "}
                {Math.floor((systemHealth.uptime % 86400) / 3600)}h{" "}
                {Math.floor((systemHealth.uptime % 3600) / 60)}m
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Since{" "}
                {new Date(
                  new Date().getTime() - systemHealth.uptime * 1000,
                ).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth.metrics.requestsPerMinute} req/min
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {systemHealth.metrics.activeConnections} active connections
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Current resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>CPU Usage</Label>
                  <span className="text-sm font-medium">
                    {systemHealth.metrics.cpu}%
                  </span>
                </div>
                <Progress value={systemHealth.metrics.cpu} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Memory Usage</Label>
                  <span className="text-sm font-medium">
                    {systemHealth.metrics.memory}%
                  </span>
                </div>
                <Progress value={systemHealth.metrics.memory} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Disk Usage</Label>
                  <span className="text-sm font-medium">
                    {systemHealth.metrics.disk}%
                  </span>
                </div>
                <Progress value={systemHealth.metrics.disk} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component Status</CardTitle>
            <CardDescription>Health of system components</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemHealth.components.map((component, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {component.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {component.status === "operational" ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : component.status === "degraded" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span
                          className={componentStatusColors[component.status]}
                        >
                          {component.status.charAt(0).toUpperCase() +
                            component.status.slice(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {component.latency ? `${component.latency}ms` : "-"}
                    </TableCell>
                    <TableCell>{component.message || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render deployment configuration
  const renderDeploymentConfig = () => {
    if (!deploymentConfig) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Deployment Configuration</CardTitle>
            <CardDescription>Configure deployment settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={deploymentConfig.environment}
                  onValueChange={(value) =>
                    updateConfig({
                      environment: value as
                        | "development"
                        | "staging"
                        | "production",
                    })
                  }
                >
                  <SelectTrigger id="environment">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={deploymentConfig.version}
                  onChange={(e) => updateConfig({ version: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="buildId">Build ID</Label>
                <Input
                  id="buildId"
                  value={deploymentConfig.buildId || ""}
                  onChange={(e) => updateConfig({ buildId: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="deploymentDate">Deployment Date</Label>
                <Input
                  id="deploymentDate"
                  type="datetime-local"
                  value={
                    deploymentConfig.deploymentDate
                      ? new Date(deploymentConfig.deploymentDate)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    updateConfig({
                      deploymentDate: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ragEnabled"
                    checked={deploymentConfig.features.ragEnabled}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        features: {
                          ...deploymentConfig.features,
                          ragEnabled: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="ragEnabled">RAG</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="webSearchEnabled"
                    checked={deploymentConfig.features.webSearchEnabled}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        features: {
                          ...deploymentConfig.features,
                          webSearchEnabled: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="webSearchEnabled">Web Search</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="documentProcessingEnabled"
                    checked={
                      deploymentConfig.features.documentProcessingEnabled
                    }
                    onCheckedChange={(checked) =>
                      updateConfig({
                        features: {
                          ...deploymentConfig.features,
                          documentProcessingEnabled: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="documentProcessingEnabled">
                    Document Processing
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="apiIntegrationsEnabled"
                    checked={deploymentConfig.features.apiIntegrationsEnabled}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        features: {
                          ...deploymentConfig.features,
                          apiIntegrationsEnabled: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="apiIntegrationsEnabled">
                    API Integrations
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="workflowsEnabled"
                    checked={deploymentConfig.features.workflowsEnabled}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        features: {
                          ...deploymentConfig.features,
                          workflowsEnabled: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="workflowsEnabled">Workflows</Label>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Scaling</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="minInstances">Minimum Instances</Label>
                  <Input
                    id="minInstances"
                    type="number"
                    min="1"
                    value={deploymentConfig.scaling.minInstances}
                    onChange={(e) =>
                      updateConfig({
                        scaling: {
                          ...deploymentConfig.scaling,
                          minInstances: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="maxInstances">Maximum Instances</Label>
                  <Input
                    id="maxInstances"
                    type="number"
                    min="1"
                    value={deploymentConfig.scaling.maxInstances}
                    onChange={(e) =>
                      updateConfig({
                        scaling: {
                          ...deploymentConfig.scaling,
                          maxInstances: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="cpuThreshold">CPU Threshold (%)</Label>
                  <Input
                    id="cpuThreshold"
                    type="number"
                    min="1"
                    max="100"
                    value={deploymentConfig.scaling.cpuThreshold}
                    onChange={(e) =>
                      updateConfig({
                        scaling: {
                          ...deploymentConfig.scaling,
                          cpuThreshold: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="memoryThreshold">Memory Threshold (%)</Label>
                  <Input
                    id="memoryThreshold"
                    type="number"
                    min="1"
                    max="100"
                    value={deploymentConfig.scaling.memoryThreshold}
                    onChange={(e) =>
                      updateConfig({
                        scaling: {
                          ...deploymentConfig.scaling,
                          memoryThreshold: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="loggingLevel">Logging Level</Label>
                  <Select
                    value={deploymentConfig.monitoring.loggingLevel}
                    onValueChange={(value) =>
                      updateConfig({
                        monitoring: {
                          ...deploymentConfig.monitoring,
                          loggingLevel: value as
                            | "debug"
                            | "info"
                            | "warn"
                            | "error",
                        },
                      })
                    }
                  >
                    <SelectTrigger id="loggingLevel">
                      <SelectValue placeholder="Select logging level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="metricsEnabled"
                    checked={deploymentConfig.monitoring.metricsEnabled}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        monitoring: {
                          ...deploymentConfig.monitoring,
                          metricsEnabled: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="metricsEnabled">
                    Enable Metrics Collection
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="alertingEnabled"
                    checked={deploymentConfig.monitoring.alertingEnabled}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        monitoring: {
                          ...deploymentConfig.monitoring,
                          alertingEnabled: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="alertingEnabled">Enable Alerting</Label>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="authEnabled"
                    checked={deploymentConfig.security.authEnabled}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        security: {
                          ...deploymentConfig.security,
                          authEnabled: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="authEnabled">Enable Authentication</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="apiKeyRequired"
                    checked={deploymentConfig.security.apiKeyRequired}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        security: {
                          ...deploymentConfig.security,
                          apiKeyRequired: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="apiKeyRequired">Require API Key</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="rateLimiting"
                    checked={deploymentConfig.security.rateLimiting}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        security: {
                          ...deploymentConfig.security,
                          rateLimiting: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="rateLimiting">Enable Rate Limiting</Label>
                </div>

                {deploymentConfig.security.rateLimiting && (
                  <div>
                    <Label htmlFor="requestsPerMinute">
                      Requests Per Minute
                    </Label>
                    <Input
                      id="requestsPerMinute"
                      type="number"
                      min="1"
                      value={deploymentConfig.security.requestsPerMinute || 100}
                      onChange={(e) =>
                        updateConfig({
                          security: {
                            ...deploymentConfig.security,
                            requestsPerMinute: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Backup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="backupEnabled"
                    checked={deploymentConfig.backup.enabled}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        backup: {
                          ...deploymentConfig.backup,
                          enabled: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="backupEnabled">Enable Backups</Label>
                </div>

                {deploymentConfig.backup.enabled && (
                  <>
                    <div>
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select
                        value={deploymentConfig.backup.frequency}
                        onValueChange={(value) =>
                          updateConfig({
                            backup: {
                              ...deploymentConfig.backup,
                              frequency: value as "hourly" | "daily" | "weekly",
                            },
                          })
                        }
                      >
                        <SelectTrigger id="backupFrequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="retentionDays">
                        Retention Period (days)
                      </Label>
                      <Input
                        id="retentionDays"
                        type="number"
                        min="1"
                        value={deploymentConfig.backup.retentionDays}
                        onChange={(e) =>
                          updateConfig({
                            backup: {
                              ...deploymentConfig.backup,
                              retentionDays: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render backups
  const renderBackups = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Backups</CardTitle>
                <CardDescription>Manage system backups</CardDescription>
              </div>
              <Button onClick={createBackup} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                )}
                Create Backup
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {backups.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Retention Until</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">
                        {backup.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            backup.type === "full" ? "default" : "outline"
                          }
                        >
                          {backup.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBytes(backup.size)}</TableCell>
                      <TableCell>{formatDate(backup.createdAt)}</TableCell>
                      <TableCell>{formatDate(backup.retentionDate)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreFromBackup(backup.id)}
                            disabled={isLoading}
                          >
                            <ArrowUpFromLine className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(backup.location)
                                  }
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy location</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No backups available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render deployment documentation
  const renderDeploymentDocs = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Deployment Documentation</CardTitle>
                <CardDescription>
                  Generated based on current configuration
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(deploymentDocs)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy documentation to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {deploymentDocs}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render CI/CD configuration
  const renderCiCdConfig = () => {
    if (!cicdConfig) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>CI/CD Pipeline Configuration</CardTitle>
                <CardDescription>
                  GitHub Actions workflow configuration
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(JSON.stringify(cicdConfig, null, 2))
                      }
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy configuration to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {JSON.stringify(cicdConfig, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render Kubernetes manifest
  const renderK8sManifest = () => {
    if (!k8sManifest) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kubernetes Deployment Manifest</CardTitle>
                <CardDescription>
                  Generated based on current configuration
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(JSON.stringify(k8sManifest, null, 2))
                      }
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy manifest to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {JSON.stringify(k8sManifest, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-2 mb-10">
        <h1 className="text-3xl font-bold">Deployment Dashboard</h1>
        <p className="text-muted-foreground">
          Manage deployments, monitor system health, and configure settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="cicd">CI/CD</TabsTrigger>
          <TabsTrigger value="k8s">Kubernetes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderHealthStatus()}
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          {renderDeploymentConfig()}
        </TabsContent>

        <TabsContent value="backups" className="mt-6">
          {renderBackups()}
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          {renderDeploymentDocs()}
        </TabsContent>

        <TabsContent value="cicd" className="mt-6">
          {renderCiCdConfig()}
        </TabsContent>

        <TabsContent value="k8s" className="mt-6">
          {renderK8sManifest()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
