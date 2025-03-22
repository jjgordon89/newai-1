import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditLogViewer } from '@/components/security/AuditLogViewer';
import { DocumentAccessControl } from '@/components/security/DocumentAccessControl';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Activity,
  FileText,
  Settings,
  BarChart as BarChartIcon,
  Search,
  Database,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  testDocumentProcessing, 
  testVectorSearch, 
  testRagPerformance, 
  clearPerformanceResults 
} from '@/redux/slices/performanceSlice';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Mock performance data
const performanceData = [
  {
    name: 'Jan',
    documentProcessing: 120,
    vectorSearch: 80,
    ragQuery: 200,
  },
  {
    name: 'Feb',
    documentProcessing: 140,
    vectorSearch: 100,
    ragQuery: 220,
  },
  {
    name: 'Mar',
    documentProcessing: 160,
    vectorSearch: 120,
    ragQuery: 250,
  },
  {
    name: 'Apr',
    documentProcessing: 180,
    vectorSearch: 140,
    ragQuery: 280,
  },
  {
    name: 'May',
    documentProcessing: 200,
    vectorSearch: 160,
    ragQuery: 310,
  },
  {
    name: 'Jun',
    documentProcessing: 220,
    vectorSearch: 180,
    ragQuery: 340,
  },
];

// Mock benchmark data for comparison
const benchmarkData = [
  {
    name: 'Document Processing',
    current: 180,
    benchmark: 150,
  },
  {
    name: 'Vector Search',
    current: 65,
    benchmark: 80,
  },
  {
    name: 'RAG Query',
    current: 320,
    benchmark: 280,
  },
  {
    name: 'Indexing',
    current: 95,
    benchmark: 100,
  },
];

const sampleDocumentId = 'doc-123456';
const currentUserId = 'user-789012';

export default function SecurityAndPerformance() {
  const dispatch = useAppDispatch();
  const { testResults, benchmarks, isLoading, error } = useAppSelector(state => state.performance);
  
  const [activeSecurityTab, setActiveSecurityTab] = useState('auditLogs');
  const [activePerformanceTab, setActivePerformanceTab] = useState('overview');
  const [testDocumentPath, setTestDocumentPath] = useState('');
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [testTopK, setTestTopK] = useState('5');
  
  // Handle document processing test
  const handleDocumentProcessingTest = () => {
    if (testDocumentPath) {
      dispatch(testDocumentProcessing({
        filePaths: [testDocumentPath],
        config: {
          chunkSize: 1000,
          chunkOverlap: 200,
          extractMetadata: true
        }
      }));
    }
  };
  
  // Handle vector search test
  const handleVectorSearchTest = () => {
    if (testSearchQuery) {
      dispatch(testVectorSearch({
        queries: [testSearchQuery],
        config: {
          topK: parseInt(testTopK),
          similarityThreshold: 0.7
        }
      }));
    }
  };
  
  // Handle RAG test
  const handleRagTest = () => {
    if (testSearchQuery) {
      dispatch(testRagPerformance({
        queries: [testSearchQuery],
        config: {
          useQueryExpansion: true,
          useReranking: true,
          enhancedContext: true,
          topK: parseInt(testTopK)
        }
      }));
    }
  };
  
  // Clear results
  const handleClearResults = () => {
    dispatch(clearPerformanceResults());
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security & Performance</h1>
        <p className="text-muted-foreground">
          Monitor system security and performance metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
            <CardDescription>
              Audit logs and access control management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="auditLogs" onValueChange={setActiveSecurityTab}>
              <TabsList className="w-full">
                <TabsTrigger value="auditLogs" className="flex-1">Audit Logs</TabsTrigger>
                <TabsTrigger value="accessControl" className="flex-1">Access Control</TabsTrigger>
              </TabsList>
              <div className="mt-4">
                {activeSecurityTab === 'auditLogs' ? (
                  <div className="h-[300px] overflow-y-auto border rounded-md p-4">
                    <div className="text-sm text-center text-muted-foreground mb-4">
                      Audit log sample (view full logs in the Security section below)
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-2 border rounded-md flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Document {i} was accessed</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] overflow-y-auto border rounded-md p-4">
                    <div className="text-sm text-center text-muted-foreground mb-4">
                      Document access control sample (view full controls in the Security section below)
                    </div>
                    <div className="space-y-3">
                      <div className="p-2 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">Document-1</div>
                          <div className="text-xs bg-primary/20 text-primary rounded-full px-2 py-1">Owner</div>
                        </div>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">Document-2</div>
                          <div className="text-xs bg-blue-500/20 text-blue-500 rounded-full px-2 py-1">Editor</div>
                        </div>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">Document-3</div>
                          <div className="text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-1">Viewer</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Performance
            </CardTitle>
            <CardDescription>
              System performance metrics and benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" onValueChange={setActivePerformanceTab}>
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
              </TabsList>
              <div className="mt-4">
                {activePerformanceTab === 'overview' ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={benchmarkData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="current" name="Current" fill="#8884d8" />
                        <Bar dataKey="benchmark" name="Industry Benchmark" fill="#82ca9d" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="documentProcessing" 
                          name="Document Processing (ms)"
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="vectorSearch" 
                          name="Vector Search (ms)"
                          stroke="#82ca9d" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ragQuery" 
                          name="RAG Query (ms)"
                          stroke="#ffc658" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Main tabs for full components */}
      <Tabs defaultValue="security" className="w-full mb-8">
        <TabsList className="w-full">
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance Testing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="security" className="mt-6">
          <Tabs defaultValue="auditLogs">
            <TabsList>
              <TabsTrigger value="auditLogs">Audit Logs</TabsTrigger>
              <TabsTrigger value="accessControl">Access Control</TabsTrigger>
            </TabsList>
            <TabsContent value="auditLogs" className="mt-4">
              <AuditLogViewer />
            </TabsContent>
            <TabsContent value="accessControl" className="mt-4">
              <DocumentAccessControl 
                documentId={sampleDocumentId}
                documentTitle="Sample Document"
                currentUserId={currentUserId}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Document Processing Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2" />
                    Document Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="docPath">Document Path</Label>
                      <Input 
                        id="docPath" 
                        value={testDocumentPath}
                        onChange={e => setTestDocumentPath(e.target.value)}
                        placeholder="Enter document path"
                      />
                    </div>
                    <Button 
                      onClick={handleDocumentProcessingTest}
                      disabled={isLoading || !testDocumentPath}
                      className="w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <span className="mr-2">Testing...</span>
                          <span className="animate-spin">◌</span>
                        </div>
                      ) : 'Run Test'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Vector Search Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Search className="h-5 w-5 mr-2" />
                    Vector Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="searchQuery">Search Query</Label>
                      <Input 
                        id="searchQuery" 
                        value={testSearchQuery}
                        onChange={e => setTestSearchQuery(e.target.value)}
                        placeholder="Enter search query"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topK">Top K Results</Label>
                      <Select 
                        value={testTopK} 
                        onValueChange={setTestTopK}
                      >
                        <SelectTrigger id="topK">
                          <SelectValue placeholder="Number of results" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 results</SelectItem>
                          <SelectItem value="5">5 results</SelectItem>
                          <SelectItem value="10">10 results</SelectItem>
                          <SelectItem value="20">20 results</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleVectorSearchTest}
                      disabled={isLoading || !testSearchQuery}
                      className="w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <span className="mr-2">Testing...</span>
                          <span className="animate-spin">◌</span>
                        </div>
                      ) : 'Run Test'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* RAG Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Database className="h-5 w-5 mr-2" />
                    RAG Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ragQuery">RAG Query</Label>
                      <Input 
                        id="ragQuery" 
                        value={testSearchQuery}
                        onChange={e => setTestSearchQuery(e.target.value)}
                        placeholder="Enter RAG query"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ragTopK">Context Size</Label>
                      <Select 
                        value={testTopK} 
                        onValueChange={setTestTopK}
                      >
                        <SelectTrigger id="ragTopK">
                          <SelectValue placeholder="Context size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 chunks</SelectItem>
                          <SelectItem value="5">5 chunks</SelectItem>
                          <SelectItem value="10">10 chunks</SelectItem>
                          <SelectItem value="20">20 chunks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleRagTest}
                      disabled={isLoading || !testSearchQuery}
                      className="w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <span className="mr-2">Testing...</span>
                          <span className="animate-spin">◌</span>
                        </div>
                      ) : 'Run Test'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Test Results */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Test Results</CardTitle>
                  <CardDescription>
                    Performance test results and metrics
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearResults}
                  disabled={testResults.length === 0 && benchmarks.length === 0}
                >
                  Clear Results
                </Button>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 && benchmarks.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-md">
                    <BarChartIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No test results yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Run tests above to see performance metrics
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Performance Test Results */}
                    {testResults.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Performance Tests</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-2">Test</th>
                                <th className="text-left py-2 px-2">Duration</th>
                                <th className="text-left py-2 px-2">Status</th>
                                <th className="text-left py-2 px-2">Key Metrics</th>
                              </tr>
                            </thead>
                            <tbody>
                              {testResults.map((result, i) => (
                                <tr key={i} className="border-b">
                                  <td className="py-3 px-2 font-medium">{result.testName}</td>
                                  <td className="py-3 px-2">{result.duration}ms</td>
                                  <td className="py-3 px-2">
                                    {result.success ? (
                                      <span className="text-green-600 flex items-center">
                                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                                        Success
                                      </span>
                                    ) : (
                                      <span className="text-red-600 flex items-center">
                                        <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                                        Failed
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-2">
                                    <div className="text-xs space-y-1">
                                      {Object.entries(result.metrics).map(([key, value]) => (
                                        <div key={key}>
                                          <span className="font-medium">{key}:</span> {value !== null && value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : null}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {/* Load Test Benchmarks */}
                    {benchmarks.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Load Test Benchmarks</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-2">Test</th>
                                <th className="text-left py-2 px-2">Users</th>
                                <th className="text-left py-2 px-2">Requests</th>
                                <th className="text-left py-2 px-2">Avg. Time</th>
                                <th className="text-left py-2 px-2">Success Rate</th>
                                <th className="text-left py-2 px-2">Throughput</th>
                              </tr>
                            </thead>
                            <tbody>
                              {benchmarks.map((benchmark, i) => (
                                <tr key={i} className="border-b">
                                  <td className="py-3 px-2 font-medium">{benchmark.testName}</td>
                                  <td className="py-3 px-2">{benchmark.concurrentUsers}</td>
                                  <td className="py-3 px-2">{benchmark.totalRequests}</td>
                                  <td className="py-3 px-2">{benchmark.averageDuration.toFixed(2)}ms</td>
                                  <td className="py-3 px-2">{benchmark.successRate.toFixed(1)}%</td>
                                  <td className="py-3 px-2">{benchmark.throughput.toFixed(2)} req/s</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}