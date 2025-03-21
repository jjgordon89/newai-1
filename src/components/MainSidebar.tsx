import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import {
  Home,
  FileText,
  Settings,
  PanelLeft,
  Workflow,
  BrainCircuit,
  Database,
  MessageSquare,
  HelpCircle,
  BookOpen,
  LifeBuoy,
  Sparkles,
  Layers,
  ExternalLink
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  badge?: string | number;
  external?: boolean;
}

const NavItem = ({ icon, label, href, isActive, isCollapsed, badge, external }: NavItemProps) => {
  const content = (
    <div className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
      isActive 
        ? "bg-primary/10 text-primary font-medium" 
        : "text-muted-foreground hover:bg-accent hover:text-foreground",
      isCollapsed ? "justify-center py-3" : "w-full"
    )}>
      {icon}
      {!isCollapsed && (
        <span className="flex-1">{label}</span>
      )}
      {!isCollapsed && badge && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {badge}
        </span>
      )}
      {!isCollapsed && external && (
        <ExternalLink className="h-3 w-3" />
      )}
    </div>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    <Link to={href}>{content}</Link>
  );
};

interface MainSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function MainSidebar({ collapsed = false, onToggleCollapse }: MainSidebarProps) {
  const location = useLocation();
  const [showAll, setShowAll] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const mainNavItems = [
    { icon: <Home className="h-4 w-4" />, label: 'Home', href: '/' },
    { icon: <MessageSquare className="h-4 w-4" />, label: 'Chat', href: '/chat' },
    { icon: <Workflow className="h-4 w-4" />, label: 'Workflows', href: '/workflows', badge: "New" },
    { icon: <FileText className="h-4 w-4" />, label: 'Documents', href: '/documents' },
    { icon: <Database className="h-4 w-4" />, label: 'Knowledge Base', href: '/knowledge-base' },
    { icon: <BrainCircuit className="h-4 w-4" />, label: 'Fine-Tuning', href: '/fine-tuning' },
  ];

  const secondaryNavItems = [
    { icon: <Layers className="h-4 w-4" />, label: 'Templates', href: '/templates' },
    { icon: <Sparkles className="h-4 w-4" />, label: 'Discover', href: '/discover' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Documentation', href: 'https://docs.example.com', external: true },
  ];

  return (
    <aside className={cn(
      "flex flex-col border-r bg-background",
      collapsed ? "w-[60px]" : "w-64"
    )}>
      <div className={cn(
        "flex h-14 items-center border-b px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {collapsed ? (
          <BrainCircuit className="h-5 w-5 text-primary" />
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-lg">AI Platform</span>
          </Link>
        )}
        
        {!collapsed && (
          <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className={cn("flex flex-col gap-1 p-2", collapsed && "items-center")}>
          {mainNavItems.map((item, i) => (
            <TooltipProvider key={i} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild={collapsed}>
                  <div>
                    <NavItem
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      isActive={isActive(item.href)}
                      isCollapsed={collapsed}
                      badge={item.badge}
                    />
                  </div>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.label}
                    {item.badge && <span className="ml-1 text-xs">({item.badge})</span>}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}

          <div className={cn("my-2 border-t mx-2", collapsed && "w-4")}></div>
          
          {secondaryNavItems.slice(0, showAll ? secondaryNavItems.length : (collapsed ? 2 : 3)).map((item, i) => (
            <TooltipProvider key={i} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild={collapsed}>
                  <div>
                    <NavItem
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      isActive={isActive(item.href)}
                      isCollapsed={collapsed}
                      external={item.external}
                    />
                  </div>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {secondaryNavItems.length > 3 && !showAll && !collapsed && (
            <Button 
              variant="ghost" 
              className="justify-start text-muted-foreground text-sm px-3 py-2 h-auto"
              onClick={() => setShowAll(true)}
            >
              Show more ({secondaryNavItems.length - 3})
            </Button>
          )}
        </div>
      </ScrollArea>
      
      <div className={cn(
        "mt-auto border-t p-2",
        collapsed ? "flex flex-col items-center" : ""
      )}>
        {!collapsed && (
          <div className="mb-2">
            <WorkspaceSelector />
          </div>
        )}
        
        <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "justify-between")}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"}>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle iconOnly={collapsed} />
                </div>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"}>Theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"}>Help</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );
}