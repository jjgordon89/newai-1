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
import { Slider } from "@/components/ui/slider";
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
import {
  Activity,
  AlertCircle,
  BarChart2,
  CheckCircle,
  Clock,
  Database,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Server,
  X,
} from "lucide-react";
import performanceTestingService, {
  PerformanceTestResult,
  BenchmarkResult,
  LoadTestConfig,
} from "@/lib/performanceTesting";

export default function PerformanceTestingDashboard() {
  const [activeTab, setActiveTab] = useState("document-processing");
  const [testResults, setTestResults] = useState<PerformanceTestResult[]>([]);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>(
    [],
  );
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<Record<
    string,
    any
  > | null>(null);

  // Document processing test config
  const [documentPaths, setDocumentPaths] = useState<string[]>([]);
  const [documentPath, setDocumentPath] = useState("");
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [extractMetadata, setExtractMetadata] = useState(true);

  // Vector search test config
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [collection, setCollection] = useState("documents");

  // RAG test config
  const [ragQueries, setRagQueries] = useState<string[]>([]);
  const [ragQuery, setRagQuery] = useState("");
  const [useQueryExpansion, setUseQueryExpansion] = useState(true);
  const [useReranking, setUseReranking] = useState(true);
  const [enhancedContext, setEnhancedContext] = useState(false);
  const [ragTopK, setRagTopK] = useState(3);

  // Load test config
  const [loadTestQuery, setLoadTestQuery] = useState("");
  const [concurrentUsers, setConcurrentUsers] = useState(5);
  const [requestsPerUser, setRequestsPerUser] = useState(10);
  const [rampUpPeriod, setRampUpPeriod] = useState(2000);
  const [thinkTime, setThinkTime] = useState(500);

  // Load test results on component mount
  useEffect(() => {
    setTestResults(performanceTestingService.getResults());
    setBenchmarkResults(performanceTestingService.getBenchmarks());
  }, []);

  // Add document path
  const addDocumentPath = () => {
    if (documentPath.trim()) {
      setDocumentPaths([...documentPaths, documentPath.trim()]);
      setDocumentPath("");
    }
  };

  // Add search query
  const addSearchQuery = () => {
    if (searchQuery.trim()) {
      setSearchQueries([...searchQueries, searchQuery.trim()]);
      setSearchQuery("");
    }
  };

  // Add RAG query
  const addRagQuery = () => {
    if (ragQuery.trim()) {
      setRagQueries([...ragQueries, ragQuery.trim()]);
      setRagQuery("");
    }
  };

  // Run document processing test
  const runDocumentProcessingTest = async () => {
    if (documentPaths.length === 0) return;

    setIsRunningTest(true);
    try {
      const result = await performanceTestingService.testDocumentProcessing(
        documentPaths,
        { chunkSize, chunkOverlap, extractMetadata },
      );

      setTestResults(performanceTestingService.getResults());
      setComparisonResults(
        performanceTestingService.compareWithIndustryBenchmarks(result),
      );
    } catch (error) {
      console.error("Error running document processing test:", error);
    } finally {
      setIsRunningTest(false);
    }
  };

  // Run vector search test
  const runVectorSearchTest = async () => {
    if (searchQueries.length === 0) return;

    setIsRunningTest(true);
    try {
      const result = await performanceTestingService.testVectorSearch(
        searchQueries,
        { topK, similarityThreshold, collection },
      );

      setTestResults(performanceTestingService.getResults());
      setComparisonResults(
        performanceTestingService.compareWithIndustryBenchmarks(result),
      );
    } catch (error) {
      console.error("Error running vector search test:", error);
    } finally {
      setIsRunningTest(false);
    }
  };

  // Run RAG performance test
  const runRagPerformanceTest = async () => {
    if (ragQueries.length === 0) return;

    setIsRunningTest(true);
    try {
      const result = await performanceTestingService.testRagPerformance(
        ragQueries,
        { useQueryExpansion, useReranking, enhancedContext, topK: ragTopK },
      );

      setTestResults(performanceTestingService.getResults());
      setComparisonResults(
        performanceTestingService.compareWithIndustryBenchmarks(result),
      );
    } catch (error) {
      console.error("Error running RAG performance test:", error);
    } finally {
      setIsRunningTest(false);
    }
  };

  // Run load test
  const runLoadTest = async () => {
    if (!loadTestQuery.trim()) return;

    setIsRunningTest(true);
    try {
      const config: LoadTestConfig = {
        concurrentUsers,
        requestsPerUser,
        rampUpPeriod,
        thinkTime,
      };

      const result = await performanceTestingService.runLoadTest(
        loadTestQuery,
        config,
      );
      setBenchmarkResults(performanceTestingService.getBenchmarks());
    } catch (error) {
      console.error("Error running load test:", error);
    } finally {
      setIsRunningTest(false);
    }
  };

  // Clear all test results
  const clearAllResults = () => {
    performanceTestingService.clearResults();
    setTestResults([]);
    setBenchmarkResults([]);
    setComparisonResults(null);
  };

  // Format duration in ms to a readable string
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(2)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  // Render test results table
  const renderTestResultsTable = () => {
    if (testResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No test results available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Run a test to see results here
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Key Metrics</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testResults.map((result, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{result.testName}</TableCell>
              <TableCell>{formatDuration(result.duration)}</TableCell>
              <TableCell>
                {result.success ? (
                  <Badge className="bg-green-100 text-green-800">Success</Badge>
                ) : (
                  <Badge variant="destructive">Failed</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {Object.entries(result.metrics).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="font-medium">{key}:</span>{" "}
                      {typeof value === "number" ? value.toFixed(2) : value}
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Render benchmark results
  const renderBenchmarkResults = () => {
    if (benchmarkResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No benchmark results available
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Run a load test to see results here
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {benchmarkResults.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{result.testName}</CardTitle>
              <CardDescription>
                {new Date(result.startTime).toLocaleString()} -{" "}
                {formatDuration(result.duration)} duration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Test Configuration
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Concurrent Users:</span>{" "}
                      {result.concurrentUsers}
                    </div>
                    <div>
                      <span className="font-medium">Total Requests:</span>{" "}
                      {result.totalRequests}
                    </div>
                    <div>
                      <span className="font-medium">Success Rate:</span>{" "}
                      {result.successRate.toFixed(2)}%
                    </div>
                    <div>
                      <span className="font-medium">Throughput:</span>{" "}
                      {result.throughput.toFixed(2)} req/s
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Response Times</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Average:</span>{" "}
                      {formatDuration(result.averageDuration)}
                    </div>
                    <div>
                      <span className="font-medium">Min:</span>{" "}
                      {formatDuration(result.minDuration)}
                    </div>
                    <div>
                      <span className="font-medium">Max:</span>{" "}
                      {formatDuration(result.maxDuration)}
                    </div>
                    <div>
                      <span className="font-medium">p95:</span>{" "}
                      {formatDuration(result.p95)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render industry benchmark comparison
  const renderBenchmarkComparison = () => {
    if (!comparisonResults) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Industry Benchmark Comparison</CardTitle>
          <CardDescription>
            Comparing {comparisonResults.testName} performance against industry
            standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comparisonResults.message ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>{comparisonResults.message}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {Object.entries(comparisonResults.metrics).map(
                ([metric, data]: [string, any]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{metric}</h4>
                      <Badge
                        className={
                          data.status === "above"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        {data.percentageDiff > 0 ? "+" : ""}
                        {data.percentageDiff.toFixed(2)}% {data.status}{" "}
                        benchmark
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm">
                        <span className="font-medium">Your Result:</span>{" "}
                        {data.actual.toFixed(2)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Industry Benchmark:</span>{" "}
                        {data.benchmark.toFixed(2)}
                      </div>
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        (data.actual / data.benchmark) * 100,
                      )}
                      className="h-2"
                    />
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background">
        <h1 className="text-2xl font-bold">Performance Testing Dashboard</h1>
        <p className="text-muted-foreground">
          Test and optimize system performance
        </p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Document Processing
              </CardTitle>
              <CardDescription>
                Test document processing performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-medium mb-1">Key Metrics:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Documents per second</li>
                  <li>Processing time per document</li>
                  <li>Bytes processed per second</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-purple-500" />
                Vector Search
              </CardTitle>
              <CardDescription>Test vector search performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-medium mb-1">Key Metrics:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Average query time</li>
                  <li>Queries per second</li>
                  <li>Result relevance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-green-500" />
                Load Testing
              </CardTitle>
              <CardDescription>Test system under load</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-medium mb-1">Key Metrics:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Response time percentiles</li>
                  <li>Throughput (requests/second)</li>
                  <li>Success rate</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-3xl mb-6">
            <TabsTrigger value="document-processing">
              <FileText className="h-4 w-4 mr-2" />
              Document Processing
            </TabsTrigger>
            <TabsTrigger value="vector-search">
              <Search className="h-4 w-4 mr-2" />
              Vector Search
            </TabsTrigger>
            <TabsTrigger value="rag-performance">
              <Database className="h-4 w-4 mr-2" />
              RAG Performance
            </TabsTrigger>
            <TabsTrigger value="load-testing">
              <Activity className="h-4 w-4 mr-2" />
              Load Testing
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <TabsContent value="document-processing" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Processing Test</CardTitle>
                    <CardDescription>
                      Test the performance of document processing pipeline
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="document-path">Document Path</Label>
                      <div className="flex gap-2">
                        <Input
                          id="document-path"
                          value={documentPath}
                          onChange={(e) => setDocumentPath(e.target.value)}
                          placeholder="Enter document path"
                        />
                        <Button onClick={addDocumentPath} type="button">
                          Add
                        </Button>
                      </div>
                    </div>

                    {documentPaths.length > 0 && (
                      <div className="space-y-2">
                        <Label>Document Paths to Test</Label>
                        <ScrollArea className="h-24 border rounded-md p-2">
                          <ul className="space-y-1">
                            {documentPaths.map((path, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-center justify-between"
                              >
                                <span className="truncate">{path}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    setDocumentPaths(
                                      documentPaths.filter(
                                        (_, i) => i !== index,
                                      ),
                                    )
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="chunk-size">
                        Chunk Size: {chunkSize}
                      </Label>
                      <Slider
                        id="chunk-size"
                        min={100}
                        max={2000}
                        step={100}
                        value={[chunkSize]}
                        onValueChange={(value) => setChunkSize(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chunk-overlap">
                        Chunk Overlap: {chunkOverlap}
                      </Label>
                      <Slider
                        id="chunk-overlap"
                        min={0}
                        max={500}
                        step={50}
                        value={[chunkOverlap]}
                        onValueChange={(value) => setChunkOverlap(value[0])}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="extract-metadata"
                        checked={extractMetadata}
                        onCheckedChange={setExtractMetadata}
                      />
                      <Label htmlFor="extract-metadata">Extract Metadata</Label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={runDocumentProcessingTest}
                      disabled={isRunningTest || documentPaths.length === 0}
                      className="w-full"
                    >
                      {isRunningTest ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running Test...
                        </>
                      ) : (
                        <>Run Test</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="vector-search" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Vector Search Test</CardTitle>
                    <CardDescription>
                      Test the performance of vector search operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="search-query">Search Query</Label>
                      <div className="flex gap-2">
                        <Input
                          id="search-query"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Enter search query"
                        />
                        <Button onClick={addSearchQuery} type="button">
                          Add
                        </Button>
                      </div>
                    </div>

                    {searchQueries.length > 0 && (
                      <div className="space-y-2">
                        <Label>Search Queries to Test</Label>
                        <ScrollArea className="h-24 border rounded-md p-2">
                          <ul className="space-y-1">
                            {searchQueries.map((query, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-center justify-between"
                              >
                                <span className="truncate">{query}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    setSearchQueries(
                                      searchQueries.filter(
                                        (_, i) => i !== index,
                                      ),
                                    )
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="collection">Collection</Label>
                      <Select value={collection} onValueChange={setCollection}>
                        <SelectTrigger id="collection">
                          <SelectValue placeholder="Select collection" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="knowledge-base">
                            Knowledge Base
                          </SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="top-k">Top K: {topK}</Label>
                      <Slider
                        id="top-k"
                        min={1}
                        max={20}
                        step={1}
                        value={[topK]}
                        onValueChange={(value) => setTopK(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="similarity-threshold">
                        Similarity Threshold: {similarityThreshold.toFixed(2)}
                      </Label>
                      <Slider
                        id="similarity-threshold"
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        value={[similarityThreshold]}
                        onValueChange={(value) =>
                          setSimilarityThreshold(value[0])
                        }
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={runVectorSearchTest}
                      disabled={isRunningTest || searchQueries.length === 0}
                      className="w-full"
                    >
                      {isRunningTest ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running Test...
                        </>
                      ) : (
                        <>Run Test</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="rag-performance" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>RAG Performance Test</CardTitle>
                    <CardDescription>
                      Test the performance of RAG query processing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rag-query">RAG Query</Label>
                      <div className="flex gap-2">
                        <Input
                          id="rag-query"
                          value={ragQuery}
                          onChange={(e) => setRagQuery(e.target.value)}
                          placeholder="Enter RAG query"
                        />
                        <Button onClick={addRagQuery} type="button">
                          Add
                        </Button>
                      </div>
                    </div>

                    {ragQueries.length > 0 && (
                      <div className="space-y-2">
                        <Label>RAG Queries to Test</Label>
                        <ScrollArea className="h-24 border rounded-md p-2">
                          <ul className="space-y-1">
                            {ragQueries.map((query, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-center justify-between"
                              >
                                <span className="truncate">{query}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    setRagQueries(
                                      ragQueries.filter((_, i) => i !== index),
                                    )
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="rag-top-k">Top K: {ragTopK}</Label>
                      <Slider
                        id="rag-top-k"
                        min={1}
                        max={10}
                        step={1}
                        value={[ragTopK]}
                        onValueChange={(value) => setRagTopK(value[0])}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="query-expansion"
                        checked={useQueryExpansion}
                        onCheckedChange={setUseQueryExpansion}
                      />
                      <Label htmlFor="query-expansion">
                        Use Query Expansion
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="reranking"
                        checked={useReranking}
                        onCheckedChange={setUseReranking}
                      />
                      <Label htmlFor="reranking">Use Reranking</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enhanced-context"
                        checked={enhancedContext}
                        onCheckedChange={setEnhancedContext}
                      />
                      <Label htmlFor="enhanced-context">Enhanced Context</Label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={runRagPerformanceTest}
                      disabled={isRunningTest || ragQueries.length === 0}
                      className="w-full"
                    >
                      {isRunningTest ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running Test...
                        </>
                      ) : (
                        <>Run Test</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="load-testing" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Load Testing</CardTitle>
                    <CardDescription>
                      Test system performance under load
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="load-test-query">Test Query</Label>
                      <Input
                        id="load-test-query"
                        value={loadTestQuery}
                        onChange={(e) => setLoadTestQuery(e.target.value)}
                        placeholder="Enter query for load testing"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="concurrent-users">
                        Concurrent Users: {concurrentUsers}
                      </Label>
                      <Slider
                        id="concurrent-users"
                        min={1}
                        max={50}
                        step={1}
                        value={[concurrentUsers]}
                        onValueChange={(value) => setConcurrentUsers(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requests-per-user">
                        Requests Per User: {requestsPerUser}
                      </Label>
                      <Slider
                        id="requests-per-user"
                        min={1}
                        max={50}
                        step={1}
                        value={[requestsPerUser]}
                        onValueChange={(value) => setRequestsPerUser(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ramp-up-period">
                        Ramp Up Period: {rampUpPeriod}ms
                      </Label>
                      <Slider
                        id="ramp-up-period"
                        min={0}
                        max={10000}
                        step={500}
                        value={[rampUpPeriod]}
                        onValueChange={(value) => setRampUpPeriod(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="think-time">
                        Think Time: {thinkTime}ms
                      </Label>
                      <Slider
                        id="think-time"
                        min={0}
                        max={2000}
                        step={100}
                        value={[thinkTime]}
                        onValueChange={(value) => setThinkTime(value[0])}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={runLoadTest}
                      disabled={isRunningTest || !loadTestQuery.trim()}
                      className="w-full"
                    >
                      {isRunningTest ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running Load Test...
                        </>
                      ) : (
                        <>Run Load Test</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>
                      Performance test results and metrics
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearAllResults}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Results
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {activeTab === "load-testing"
                      ? renderBenchmarkResults()
                      : renderTestResultsTable()}
                  </ScrollArea>
                </CardContent>
              </Card>

              {comparisonResults &&
                activeTab !== "load-testing" &&
                renderBenchmarkComparison()}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
