import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Document } from "./DocumentList";

interface KnowledgeAnalyticsProps {
  documents: Document[];
  queryData?: {
    queries: { query: string; timestamp: Date; documentIds: string[] }[];
    topQueries: { query: string; count: number }[];
  };
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const KnowledgeAnalytics: React.FC<KnowledgeAnalyticsProps> = ({
  documents,
  queryData,
}) => {
  // Calculate document type distribution
  const documentTypeData = React.useMemo(() => {
    const typeCounts: Record<string, number> = {};
    documents.forEach((doc) => {
      const type = doc.type.toLowerCase();
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.toUpperCase(),
      value: count,
    }));
  }, [documents]);

  // Calculate document upload timeline
  const uploadTimelineData = React.useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Create a map of dates for the last 30 days
    const dateMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dateMap[dateStr] = 0;
    }

    // Count documents by upload date
    documents.forEach((doc) => {
      const dateStr = doc.uploadDate.toISOString().split("T")[0];
      if (dateMap[dateStr] !== undefined) {
        dateMap[dateStr] += 1;
      }
    });

    return Object.entries(dateMap).map(([date, count]) => ({
      date,
      count,
    }));
  }, [documents]);

  // Calculate document size distribution
  const documentSizeData = React.useMemo(() => {
    const sizeRanges = [
      { range: "0-100KB", min: 0, max: 100 * 1024 },
      { range: "100KB-1MB", min: 100 * 1024, max: 1024 * 1024 },
      { range: "1-5MB", min: 1024 * 1024, max: 5 * 1024 * 1024 },
      { range: "5-10MB", min: 5 * 1024 * 1024, max: 10 * 1024 * 1024 },
      { range: "10MB+", min: 10 * 1024 * 1024, max: Infinity },
    ];

    const counts = sizeRanges.map((range) => ({
      name: range.range,
      count: documents.filter(
        (doc) => doc.size >= range.min && doc.size < range.max,
      ).length,
    }));

    return counts;
  }, [documents]);

  // Calculate tag distribution
  const tagDistributionData = React.useMemo(() => {
    const tagCounts: Record<string, number> = {};
    documents.forEach((doc) => {
      if (doc.tags) {
        doc.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({
        name: tag,
        count,
      }));
  }, [documents]);

  // Calculate query analytics if query data is available
  const queryAnalytics = React.useMemo(() => {
    if (!queryData) return null;

    // Query volume over time (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Create a map of dates for the last 7 days
    const dateMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dateMap[dateStr] = 0;
    }

    // Count queries by date
    queryData.queries.forEach((query) => {
      const dateStr = query.timestamp.toISOString().split("T")[0];
      if (dateMap[dateStr] !== undefined) {
        dateMap[dateStr] += 1;
      }
    });

    const queryVolumeData = Object.entries(dateMap).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      queryVolumeData,
      topQueriesData: queryData.topQueries,
    };
  }, [queryData]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="documents">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">Document Analytics</TabsTrigger>
          <TabsTrigger value="queries" disabled={!queryData}>
            Query Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6 pt-4">
          {/* Document Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {documents.filter((d) => d.status === "processed").length}{" "}
                  processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    documents.reduce((acc, doc) => acc + doc.size, 0) /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg:{" "}
                  {(
                    documents.reduce((acc, doc) => acc + doc.size, 0) /
                    (documents.length || 1) /
                    1024
                  ).toFixed(2)}{" "}
                  KB per document
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Document Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documents.reduce(
                    (acc, doc) => acc + (doc.tags?.length || 0),
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Set(documents.flatMap((doc) => doc.tags || [])).size}{" "}
                  unique tags
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Document Type Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
                <CardDescription>
                  Distribution of document formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={documentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {documentTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} documents`, "Count"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Sizes</CardTitle>
                <CardDescription>Distribution by file size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={documentSizeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} documents`, "Count"]}
                      />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Timeline and Tag Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Timeline</CardTitle>
                <CardDescription>
                  Documents uploaded in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={uploadTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString();
                        }}
                        formatter={(value) => [`${value} documents`, "Uploads"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
                <CardDescription>
                  Most frequently used document tags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tagDistributionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip
                        formatter={(value) => [`${value} documents`, "Count"]}
                      />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6 pt-4">
          {queryAnalytics ? (
            <>
              {/* Query Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Queries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {queryData?.queries.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last 7 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Documents Retrieved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {queryData?.queries.length
                        ? (
                            queryData.queries.reduce(
                              (acc, q) => acc + q.documentIds.length,
                              0,
                            ) / queryData.queries.length
                          ).toFixed(1)
                        : "0"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per query
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Unique Queries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {
                        new Set(
                          queryData?.queries.map((q) => q.query.toLowerCase()),
                        ).size
                      }
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(
                        (new Set(
                          queryData?.queries.map((q) => q.query.toLowerCase()),
                        ).size /
                          (queryData?.queries.length || 1)) *
                        100
                      ).toFixed(0)}
                      % of total
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Query Volume and Top Queries */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Query Volume</CardTitle>
                    <CardDescription>
                      Queries over the last 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={queryAnalytics.queryVolumeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                          />
                          <YAxis />
                          <Tooltip
                            labelFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString();
                            }}
                            formatter={(value) => [`${value} queries`, "Count"]}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Queries</CardTitle>
                    <CardDescription>
                      Most frequent user queries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={queryAnalytics.topQueriesData}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="query"
                            type="category"
                            width={150}
                            tickFormatter={(value) =>
                              value.length > 20
                                ? `${value.substring(0, 20)}...`
                                : value
                            }
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${value} occurrences`,
                              "Count",
                            ]}
                            labelFormatter={(value) => value}
                          />
                          <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Query analytics data is not available.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeAnalytics;
