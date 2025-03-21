import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  Globe,
  FileText,
  Plug,
} from "lucide-react";
import WebSearchApiSettings from "@/components/WebSearchApiSettings";
import { apiKeyManager } from "@/lib/apiKeyManager";

export default function IntegrationsDashboard() {
  const [activeTab, setActiveTab] = useState("ai-models");
  const [isLoading, setIsLoading] = useState(true);
  const [integrationStatus, setIntegrationStatus] = useState({
    aiModels: false,
    webSearch: false,
    databases: false,
    apis: false,
    notion: false,
    confluence: false,
    googleWorkspace: false,
    sharepoint: false,
  });

  // Check integration status on component mount
  useEffect(() => {
    const checkIntegrations = async () => {
      setIsLoading(true);
      try {
        // Check web search integration
        const webSearchConfigured = [
          apiKeyManager.hasApiKey("brave"),
          apiKeyManager.hasApiKey("google"),
          apiKeyManager.hasApiKey("duckduckgo"),
          apiKeyManager.hasApiKey("serp"),
        ].some((configured) => configured);

        setIntegrationStatus((prev) => ({
          ...prev,
          webSearch: webSearchConfigured,
        }));
      } catch (error) {
        console.error("Error checking integrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIntegrations();
  }, []);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect to external services and data sources
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Refresh Status</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Integration Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 mr-2 text-primary"
                  >
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" />
                    <path d="M8.5 9.5a3.5 3.5 0 0 1 0-3.5" />
                  </svg>
                  AI Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("ai-models")}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  Web Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    {integrationStatus.webSearch ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Configured
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Configured</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("web-search")}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Database className="h-5 w-5 mr-2 text-primary" />
                  Databases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("databases")}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Plug className="h-5 w-5 mr-2 text-primary" />
                  APIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("apis")}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enterprise Connectors */}
          <h2 className="text-xl font-semibold mb-4">Enterprise Connectors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Notion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("notion")}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Confluence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("confluence")}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Google Workspace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("google-workspace")}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  SharePoint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("sharepoint")}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="ai-models">AI Models</TabsTrigger>
              <TabsTrigger value="web-search">Web Search</TabsTrigger>
              <TabsTrigger value="databases">Databases</TabsTrigger>
              <TabsTrigger value="apis">APIs</TabsTrigger>
            </TabsList>

            <TabsContent value="ai-models" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Configuration</CardTitle>
                  <CardDescription>
                    Configure AI model providers and API keys
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Configure AI model providers in the Model Settings section
                    </AlertDescription>
                  </Alert>
                  <Button onClick={() => (window.location.href = "/settings")}>
                    Go to Model Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="web-search" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Web Search Configuration</CardTitle>
                  <CardDescription>
                    Configure web search providers and API keys
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WebSearchApiSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="databases" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Configuration</CardTitle>
                  <CardDescription>
                    Connect to external databases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Database integration is not yet implemented
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apis" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Connect to third-party APIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      API integration is not yet implemented
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notion" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notion Integration</CardTitle>
                  <CardDescription>Connect to Notion workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Notion integration is not yet implemented
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="confluence" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Confluence Integration</CardTitle>
                  <CardDescription>
                    Connect to Atlassian Confluence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Confluence integration is not yet implemented
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="google-workspace" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Google Workspace Integration</CardTitle>
                  <CardDescription>
                    Connect to Google Workspace (Docs, Sheets, Drive)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Google Workspace integration is not yet implemented
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sharepoint" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>SharePoint Integration</CardTitle>
                  <CardDescription>
                    Connect to Microsoft SharePoint
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      SharePoint integration is not yet implemented
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
