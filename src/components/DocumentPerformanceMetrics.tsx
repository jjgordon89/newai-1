import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  getDocumentPerformanceMetrics,
  getDocumentUsageAnalytics,
} from "../lib/knowledgeAnalyticsService";

interface DocumentPerformanceMetricsProps {
  documentId: string;
  documentName: string;
}

export default function DocumentPerformanceMetrics({
  documentId,
  documentName,
}: DocumentPerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [usageAnalytics, setUsageAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (documentId) {
      loadMetrics();
    }
  }, [documentId]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Get document performance metrics
      const performanceMetrics = getDocumentPerformanceMetrics(documentId);
      setMetrics(performanceMetrics);

      // Get document usage analytics
      const usage = getDocumentUsageAnalytics(documentId);
      setUsageAnalytics(usage);
    } catch (error) {
      console.error("Error loading document metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no metrics are available, show a placeholder
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Performance</CardTitle>
          <CardDescription>
            No metrics available for this document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            This document has not been used in any searches yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Document Performance</CardTitle>
            <CardDescription>Usage and relevance metrics</CardDescription>
          </div>
          <Badge variant="outline">ID: {documentId.substring(0, 8)}...</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Usage Count</div>
                <div className="text-2xl font-bold">{metrics.usageCount}</div>
                <div className="text-xs text-muted-foreground">
                  Times this document was retrieved
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Average Relevance</div>
                <div className="text-2xl font-bold">
                  {(metrics.averageRelevance * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Average relevance score in search results
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Feedback Rating</div>
                <div className="text-2xl font-bold">
                  {metrics.feedbackRating.toFixed(1)}/5
                </div>
                <div className="text-xs text-muted-foreground">
                  Average user feedback rating
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Click-Through Rate</div>
                <div className="text-2xl font-bold">
                  {(metrics.clickThroughRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Percentage of searches leading to document view
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Performance Score</div>
              <Progress
                value={metrics.averageRelevance * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="pt-4">
            {usageAnalytics && usageAnalytics.usageOverTime.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={usageAnalytics.usageOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm text-center text-muted-foreground">
                  Document usage over time
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No usage data available for this document
              </div>
            )}
          </TabsContent>

          <TabsContent value="queries" className="pt-4">
            {usageAnalytics && usageAnalytics.topQueries.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={usageAnalytics.topQueries}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="query"
                        width={150}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          value.length > 25
                            ? `${value.substring(0, 25)}...`
                            : value
                        }
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm text-center text-muted-foreground">
                  Top queries that retrieved this document
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No query data available for this document
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="w-full text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
}
