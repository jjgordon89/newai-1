import React, { useState, useEffect, useMemo } from 'react';
import { 
  performanceMonitoring, 
  PerformanceMetric, 
  MetricType 
} from '@/lib/monitoring/performanceMonitoringService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  LineChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Filter,
  Download
} from 'lucide-react';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Extend MetricType to include 'all' for summaries
type SummaryType = MetricType | 'all';

interface MetricSummary {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  totalDuration: number;
}

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

/**
 * Performance Dashboard Component
 * 
 * Visualizes application performance metrics using charts and tables
 */
export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [selectedType, setSelectedType] = useState<MetricType | 'all'>('all');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(5000); // 5 seconds
  const [activeTab, setActiveTab] = useState('overview');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'startTime',
    direction: 'desc'
  });

  // Fetch metrics on component mount and at refresh interval
  useEffect(() => {
    const fetchMetrics = () => {
      const currentMetrics = performanceMonitoring.getMetrics();
      setMetrics([...currentMetrics]);
    };

    // Initial fetch
    fetchMetrics();

    // Set up refresh interval
    let intervalId: number | null = null;
    if (refreshInterval) {
      intervalId = window.setInterval(fetchMetrics, refreshInterval);
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval]);

  // Filter metrics based on search query and type
  const filteredMetrics = useMemo(() => {
    return metrics.filter(metric => {
      const matchesFilter = filter === '' || 
        metric.name.toLowerCase().includes(filter.toLowerCase()) ||
        (metric.metadata && JSON.stringify(metric.metadata).toLowerCase().includes(filter.toLowerCase()));
      
      const matchesType = selectedType === 'all' || metric.type === selectedType;
      
      return matchesFilter && matchesType;
    });
  }, [metrics, filter, selectedType]);

  // Sort metrics based on current sort configuration
  const sortedMetrics = useMemo(() => {
    return [...filteredMetrics].sort((a, b) => {
      if (sortConfig.key === 'startTime') {
        return sortConfig.direction === 'asc' 
          ? a.startTime - b.startTime 
          : b.startTime - a.startTime;
      } else if (sortConfig.key === 'duration') {
        return sortConfig.direction === 'asc' 
          ? a.duration - b.duration 
          : b.duration - a.duration;
      } else if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortConfig.key === 'type') {
        return sortConfig.direction === 'asc' 
          ? a.type.localeCompare(b.type) 
          : b.type.localeCompare(a.type);
      }
      return 0;
    });
  }, [filteredMetrics, sortConfig]);

  // Calculate metric summaries by type
const metricSummaries = useMemo(() => {
  
  // Define metric summary interface with the SummarTypey
  interface ExtendedMetricSummary extends MetricSummary {
    type: SummaryType;
  }
  
  // Create record with summaries for each type plus 'all'
  const summaries: Record<SummaryType, ExtendedMetricSummary> = {
    all: { type: 'all', count: 0, avgDuration: 0, minDuration: Infinity, maxDuration: 0, totalDuration: 0 },
    navigation: { type: 'navigation', count: 0, avgDuration: 0, minDuration: Infinity, maxDuration: 0, totalDuration: 0 },
    api: { type: 'api', count: 0, avgDuration: 0, minDuration: Infinity, maxDuration: 0, totalDuration: 0 },
    render: { type: 'render', count: 0, avgDuration: 0, minDuration: Infinity, maxDuration: 0, totalDuration: 0 },
    resource: { type: 'resource', count: 0, avgDuration: 0, minDuration: Infinity, maxDuration: 0, totalDuration: 0 },
    custom: { type: 'custom', count: 0, avgDuration: 0, minDuration: Infinity, maxDuration: 0, totalDuration: 0 }
    };

    filteredMetrics.forEach(metric => {
      // Update specific type summary
      const typeSummary = summaries[metric.type];
      typeSummary.count++;
      typeSummary.totalDuration += metric.duration;
      typeSummary.minDuration = Math.min(typeSummary.minDuration, metric.duration);
      typeSummary.maxDuration = Math.max(typeSummary.maxDuration, metric.duration);
      typeSummary.avgDuration = typeSummary.totalDuration / typeSummary.count;

      // Update overall summary
      const allSummary = summaries.all;
      allSummary.count++;
      allSummary.totalDuration += metric.duration;
      allSummary.minDuration = Math.min(allSummary.minDuration, metric.duration);
      allSummary.maxDuration = Math.max(allSummary.maxDuration, metric.duration);
      allSummary.avgDuration = allSummary.totalDuration / allSummary.count;
    });

    // Fix min duration if no metrics
    Object.values(summaries).forEach(summary => {
      if (summary.minDuration === Infinity) {
        summary.minDuration = 0;
      }
    });

    return summaries;
  }, [filteredMetrics]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    // Type distribution pie chart
    const typeDistribution: ChartData[] = Object.entries(metricSummaries)
      .filter(([type]) => type !== 'all' && metricSummaries[type as MetricType].count > 0)
      .map(([type, summary], index) => ({
        name: type,
        value: summary.count,
        fill: COLORS[index % COLORS.length]
      }));

    // Timing by type bar chart  
    const timingByType = Object.entries(metricSummaries)
      .filter(([type]) => type !== 'all' && metricSummaries[type as MetricType].count > 0)
      .map(([type, summary]) => ({
        name: type,
        avg: Math.round(summary.avgDuration * 100) / 100,
        max: Math.round(summary.maxDuration * 100) / 100,
      }));

    // Metrics over time (most recent 20)
    const timeSeriesData = [...filteredMetrics]
      .sort((a, b) => a.startTime - b.startTime)
      .slice(-20)
      .map(metric => ({
        name: metric.name.substring(0, 15) + (metric.name.length > 15 ? '...' : ''),
        duration: Math.round(metric.duration * 100) / 100,
        time: new Date(performance.timeOrigin + metric.startTime).toISOString().substring(11, 19),
        type: metric.type
      }));

    // Slow operations (duration > threshold based on type)
    const thresholds: Record<MetricType, number> = {
      api: 1000,       // 1 second for API calls
      navigation: 2000, // 2 seconds for navigation
      render: 50,       // 50ms for rendering
      resource: 1000,   // 1 second for resources
      custom: 500       // 500ms for custom operations
    };

    const slowOperations = filteredMetrics
      .filter(metric => metric.duration > thresholds[metric.type])
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(metric => ({
        name: metric.name,
        duration: Math.round(metric.duration * 100) / 100,
        type: metric.type,
        threshold: thresholds[metric.type]
      }));

    return {
      typeDistribution,
      timingByType,
      timeSeriesData,
      slowOperations
    };
  }, [filteredMetrics, metricSummaries]);

  // Download metrics as JSON
  const downloadMetrics = () => {
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `performance-metrics-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Clear collected metrics
  const clearMetrics = () => {
    performanceMonitoring.clearMetrics();
    setMetrics([]);
  };

  // Format duration for display
  const formatDuration = (duration: number): string => {
    if (duration < 1) {
      return '< 1ms';
    }
    if (duration < 1000) {
      return `${Math.round(duration)}ms`;
    }
    return `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze application performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={refreshInterval?.toString() || 'off'}
            onValueChange={(value) => setRefreshInterval(value === 'off' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Refresh rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Auto refresh off</SelectItem>
              <SelectItem value="1000">1 second</SelectItem>
              <SelectItem value="5000">5 seconds</SelectItem>
              <SelectItem value="10000">10 seconds</SelectItem>
              <SelectItem value="30000">30 seconds</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setMetrics([...performanceMonitoring.getMetrics()])} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={downloadMetrics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={clearMetrics} variant="outline" className="text-destructive">
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter metrics..."
            className="pl-9"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as MetricType | 'all')}
        >
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="api">API Calls</SelectItem>
            <SelectItem value="render">Renders</SelectItem>
            <SelectItem value="resource">Resources</SelectItem>
            <SelectItem value="navigation">Navigation</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="charts">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="details">
            <Search className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Metrics Collected</CardTitle>
                <CardDescription>Total performance entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.length}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {metricSummaries.all.count} matching filters
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Average Time</CardTitle>
                <CardDescription>Mean operation duration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatDuration(metricSummaries.all.avgDuration)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Min: {formatDuration(metricSummaries.all.minDuration)} / 
                  Max: {formatDuration(metricSummaries.all.maxDuration)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Slow Operations</CardTitle>
                <CardDescription>Operations exceeding threshold</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {chartData.slowOperations.length}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Across {Object.entries(metricSummaries)
                    .filter(([type, summary]) => type !== 'all' && summary.count > 0)
                    .length} metric types
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Metric Type Distribution</CardTitle>
                <CardDescription>Breakdown by metric category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {chartData.typeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.typeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.typeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Operation Timing by Type</CardTitle>
                <CardDescription>Average and maximum durations</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {chartData.timingByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.timingByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}ms`, 'Duration']} />
                      <Legend />
                      <Bar dataKey="avg" name="Average (ms)" fill="#0088FE" />
                      <Bar dataKey="max" name="Maximum (ms)" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Slow Operations</CardTitle>
              <CardDescription>Operations exceeding performance thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.slowOperations.length > 0 ? (
                <div className="space-y-4">
                  {chartData.slowOperations.map((op, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="font-medium">{op.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{formatDuration(op.duration)}</span>
                          <span className="text-muted-foreground ml-1">
                            (Threshold: {formatDuration(op.threshold)})
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(100, (op.threshold / op.duration) * 100)} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        {op.type} operation exceeds threshold by {Math.round((op.duration / op.threshold - 1) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-muted-foreground">No slow operations detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Recent operations duration trends</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {chartData.timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}ms`, 'Duration']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="duration" 
                      name="Duration (ms)" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Call Performance</CardTitle>
                <CardDescription>Duration of API requests</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {filteredMetrics.filter(m => m.type === 'api').length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={filteredMetrics
                        .filter(m => m.type === 'api')
                        .sort((a, b) => b.duration - a.duration)
                        .slice(0, 10)
                        .map(m => ({
                          name: m.name.split(' ')[1] || m.name, // Try to extract the HTTP method
                          duration: Math.round(m.duration * 100) / 100
                        }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}ms`, 'Duration']} />
                      <Bar dataKey="duration" name="Duration (ms)" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No API metrics available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Component Render Performance</CardTitle>
                <CardDescription>Duration of React component renders</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {filteredMetrics.filter(m => m.type === 'render').length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={filteredMetrics
                        .filter(m => m.type === 'render')
                        .sort((a, b) => b.duration - a.duration)
                        .slice(0, 10)
                        .map(m => ({
                          name: m.name.replace('Render ', '').substring(0, 15), // Extract component name
                          duration: Math.round(m.duration * 100) / 100
                        }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}ms`, 'Duration']} />
                      <Bar dataKey="duration" name="Duration (ms)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No render metrics available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed breakdown of all collected metrics
                {filteredMetrics.length > 0 && ` (${filteredMetrics.length} of ${metrics.length} total)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedMetrics.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-auto max-h-[600px]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th 
                            className="p-3 text-left font-medium cursor-pointer hover:bg-muted/80"
                            onClick={() => setSortConfig({
                              key: 'name',
                              direction: sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            })}
                          >
                            Name
                            {sortConfig.key === 'name' && (
                              <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </th>
                          <th 
                            className="p-3 text-left font-medium cursor-pointer hover:bg-muted/80"
                            onClick={() => setSortConfig({
                              key: 'type',
                              direction: sortConfig.key === 'type' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            })}
                          >
                            Type
                            {sortConfig.key === 'type' && (
                              <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </th>
                          <th 
                            className="p-3 text-left font-medium cursor-pointer hover:bg-muted/80"
                            onClick={() => setSortConfig({
                              key: 'duration',
                              direction: sortConfig.key === 'duration' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            })}
                          >
                            Duration
                            {sortConfig.key === 'duration' && (
                              <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </th>
                          <th 
                            className="p-3 text-left font-medium cursor-pointer hover:bg-muted/80"
                            onClick={() => setSortConfig({
                              key: 'startTime',
                              direction: sortConfig.key === 'startTime' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            })}
                          >
                            Time
                            {sortConfig.key === 'startTime' && (
                              <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </th>
                          <th className="p-3 text-left font-medium">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedMetrics.map((metric, index) => (
                          <tr 
                            key={metric.id} 
                            className={`border-t ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
                          >
                            <td className="p-3">{metric.name}</td>
                            <td className="p-3 capitalize">{metric.type}</td>
                            <td className="p-3 font-mono">
                              {formatDuration(metric.duration)}
                            </td>
                            <td className="p-3 font-mono">
                              {new Date(performance.timeOrigin + metric.startTime).toISOString().substring(11, 23)}
                            </td>
                            <td className="p-3">
                              <details className="text-xs">
                                <summary className="cursor-pointer hover:text-primary">
                                  Metadata
                                </summary>
                                <pre className="mt-2 bg-muted p-2 rounded-md overflow-auto max-w-xs max-h-32">
                                  {JSON.stringify(metric.metadata, null, 2)}
                                </pre>
                              </details>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No metrics found</h3>
                  <p className="text-muted-foreground">
                    {filter || selectedType !== 'all' 
                      ? 'Try changing your search criteria' 
                      : 'Interact with the application to collect performance metrics'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}