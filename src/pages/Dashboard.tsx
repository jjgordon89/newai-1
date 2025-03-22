import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/redux/hooks';
import { addNotification } from '@/redux/slices/notificationSlice';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import FunctionalityDashboard from '@/components/FunctionalityDashboard';
import { ApiKeySettings } from '@/components/ApiKeySettings';
import { ReduxNotificationCenter } from '@/components/ReduxNotificationCenter';
import { 
  BarChart3, 
  Layers, 
  Settings, 
  FileText, 
  Search, 
  UserCircle, 
  Server, 
  Activity, 
  CheckCircle, 
  Clock, 
  LayoutDashboard, 
  Database,
  Lock
} from 'lucide-react';

// Sample data for analytics
const documentsData = [
  { name: 'PDFs', count: 45 },
  { name: 'Docs', count: 32 },
  { name: 'Texts', count: 21 },
  { name: 'Excel', count: 16 },
  { name: 'Others', count: 7 },
];

const queryData = [
  { month: 'Jan', count: 120 },
  { month: 'Feb', count: 210 },
  { month: 'Mar', count: 180 },
  { month: 'Apr', count: 260 },
  { month: 'May', count: 290 },
  { month: 'Jun', count: 350 },
];

const systemData = [
  { name: 'API Usage', value: 65 },
  { name: 'Database', value: 25 },
  { name: 'File Storage', value: 10 },
];

const pieColors = ['#0088FE', '#00C49F', '#FFBB28'];

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Demo function to create a notification
  const createNotification = () => {
    dispatch(addNotification({
      title: 'Dashboard Viewed',
      message: 'You have successfully viewed the dashboard.',
      type: 'info'
    }));
  };
  
  useEffect(() => {
    // Create a notification when the dashboard loads
    createNotification();
  }, []);
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your system, analytics, and management tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createNotification}>
            Create Notification
          </Button>
          <div className="relative">
            <ReduxNotificationCenter />
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Tools & Features
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">121</div>
                <p className="text-xs text-muted-foreground">
                  12 documents added this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Queries</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,352</div>
                <p className="text-xs text-muted-foreground">
                  +22% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">API Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  Of monthly quota used
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Active in the last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
                <CardDescription>
                  Distribution of document types in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={documentsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Queries Over Time</CardTitle>
                <CardDescription>
                  Monthly query volume trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={queryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
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
              </CardContent>
            </Card>
          </div>
          
          {/* Activity Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-8">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          {i % 3 === 0 ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : i % 3 === 1 ? (
                            <FileText className="h-4 w-4 text-primary" />
                          ) : (
                            <UserCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {i % 3 === 0
                            ? "Document Processing Complete"
                            : i % 3 === 1
                            ? "New Query Executed"
                            : "User Login"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {i % 3 === 0
                            ? `Document 'quarterly-report-${10 - i}.pdf' was processed successfully.`
                            : i % 3 === 1
                            ? `Query "What are the main findings in the Q${4 - (i % 4)} report?" was executed.`
                            : `User David${i} logged in from a new device.`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(i / 2)} {i <= 1 ? "hour" : "hours"} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  Performance metrics for the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { day: '1', cpu: 45, memory: 30, network: 20 },
                        { day: '5', cpu: 50, memory: 35, network: 25 },
                        { day: '10', cpu: 40, memory: 40, network: 30 },
                        { day: '15', cpu: 70, memory: 55, network: 40 },
                        { day: '20', cpu: 60, memory: 50, network: 45 },
                        { day: '25', cpu: 55, memory: 45, network: 35 },
                        { day: '30', cpu: 65, memory: 60, network: 40 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU Usage (%)" />
                      <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory Usage (%)" />
                      <Line type="monotone" dataKey="network" stroke="#ffc658" name="Network (MB/s)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>
                  Distribution of system resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={systemData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {systemData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Response Time Analysis</CardTitle>
              <CardDescription>
                Average response times by query complexity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { complexity: 'Simple', rag: 150, direct: 120, hybrid: 135 },
                      { complexity: 'Moderate', rag: 350, direct: 220, hybrid: 280 },
                      { complexity: 'Complex', rag: 750, direct: 500, hybrid: 600 },
                      { complexity: 'Very Complex', rag: 1250, direct: 800, hybrid: 950 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="complexity" />
                    <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="rag" name="RAG" fill="#8884d8" />
                    <Bar dataKey="direct" name="Direct" fill="#82ca9d" />
                    <Bar dataKey="hybrid" name="Hybrid" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <FunctionalityDashboard />
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="flex items-center justify-start w-full" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Rebuild Index
                  </Button>
                  <Button className="flex items-center justify-start w-full" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button className="flex items-center justify-start w-full" variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Security Audit
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <ApiKeySettings />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}