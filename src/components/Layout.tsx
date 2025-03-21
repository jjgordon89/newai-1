import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MainSidebar } from './MainSidebar';
import { Button } from './ui/button';
import {
  Menu,
  X,
  Search,
  PanelLeft,
  MessageSquare,
  User
} from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { UserMenu } from '@/components/UserMenu';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <MainSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <MainSidebar />
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Desktop sidebar toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="hidden md:flex"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            
            {/* Page title - based on current route */}
            <div className="md:ml-2">
              <h1 className="text-lg font-semibold">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
          </div>
          
          {/* Search and actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-[200px] lg:w-[320px] bg-muted/50"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MessageSquare className="h-5 w-5" />
            </Button>
            
            <NotificationCenter />
            
            <UserMenu />
          </div>
        </header>
        
        {/* Content area with any padding managed by child */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-200",
          sidebarCollapsed ? "md:pl-[60px]" : "md:pl-64"
        )}>
          {children}
        </main>
      </div>
      
      {/* Global keyboard shortcuts */}
      <KeyboardShortcuts />
    </div>
  );
};

// Helper to get page title based on current route
function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/workflow-builder')) return 'Workflow Builder';
  if (pathname.startsWith('/documents')) return 'Documents';
  if (pathname.startsWith('/knowledge-base')) return 'Knowledge Base';
  if (pathname.startsWith('/fine-tuning')) return 'Fine-Tuning';
  if (pathname.startsWith('/profile')) return 'Settings & Profile';
  if (pathname.startsWith('/chat')) return 'Chat';
  
  // Default title for unknown routes
  return 'AI Platform';
}