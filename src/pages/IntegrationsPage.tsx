import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeyManager } from '@/components/integrations/ApiKeyManager';
import { WebSearch } from '@/components/integrations/WebSearch';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Globe, 
  ArrowRight, 
  Library, 
  ServerCog, 
  Cloud, 
  DollarSign, 
  Database, 
  RefreshCw 
} from 'lucide-react';

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('api-keys');
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrations & External Services</h1>
        <p className="text-muted-foreground">
          Manage API keys, third-party connections, and external services
        </p>
      </div>
      
      <Tabs defaultValue="api-keys" onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-8">
          <TabsTrigger value="api-keys" className="flex items-center justify-center">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="web-search" className="flex items-center justify-center">
            <Globe className="h-4 w-4 mr-2" />
            Web Search
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center justify-center">
            <ArrowRight className="h-4 w-4 mr-2" />
            Connections
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys" className="mt-0">
          <ApiKeyManager />
        </TabsContent>
        
        <TabsContent value="web-search" className="mt-0">
          <WebSearch />
        </TabsContent>
        
        <TabsContent value="connections" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Workspace */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <Cloud className="h-5 w-5 mr-2 text-blue-500" />
                    Google Workspace
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to Google Drive, Docs, and Gmail
                  </p>
                </div>
                <div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Access files from Google Drive
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Import data from Google Docs
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Send emails through Gmail
                </li>
              </ul>
              <div className="text-xs text-muted-foreground">
                Status: Not connected
              </div>
            </div>
            
            {/* Microsoft 365 */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <ServerCog className="h-5 w-5 mr-2 text-blue-700" />
                    Microsoft 365
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to OneDrive, SharePoint, and Outlook
                  </p>
                </div>
                <div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Access files from OneDrive
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Integrate with SharePoint sites
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Manage emails in Outlook
                </li>
              </ul>
              <div className="text-xs text-muted-foreground">
                Status: Not connected
              </div>
            </div>
            
            {/* Notion */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <Library className="h-5 w-5 mr-2" />
                    Notion
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to Notion databases and pages
                  </p>
                </div>
                <div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Import pages from Notion
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Query Notion databases
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Create new pages in Notion
                </li>
              </ul>
              <div className="text-xs text-muted-foreground">
                Status: Not connected
              </div>
            </div>
            
            {/* Confluence */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-500" />
                    Confluence
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to Atlassian Confluence workspace
                  </p>
                </div>
                <div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Import pages from Confluence
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Search Confluence content
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Create new pages in Confluence
                </li>
              </ul>
              <div className="text-xs text-muted-foreground">
                Status: Not connected
              </div>
            </div>
            
            {/* Payment Processor */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Payment Processor
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to Stripe for payment processing
                  </p>
                </div>
                <div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Process subscription payments
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Manage payment methods
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Track payment history
                </li>
              </ul>
              <div className="text-xs text-muted-foreground">
                Status: Not connected
              </div>
            </div>
            
            {/* Data Sync */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2 text-purple-600" />
                    Data Sync
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Set up automated data synchronization
                  </p>
                </div>
                <div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Regularly sync external data sources
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Schedule automated imports
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Configure webhook integrations
                </li>
              </ul>
              <div className="text-xs text-muted-foreground">
                Status: Not configured
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
