import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Cpu,
  Plus,
  Settings,
  Zap,
  Menu,
  Search,
  BrainCircuit,
  Upload,
  Database,
  FileText,
  Command,
  Workflow
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Link } from "react-router-dom";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { ModelSelector } from "./ModelSelector";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function ChatHeader() {
  const { activeModel, ragEnabled, webSearchEnabled } = useChat();
  const { activeWorkspaceId, workspaces } = useWorkspace();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  
  // Track scroll position to apply shadows on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full backdrop-blur-md transition-all duration-200",
        scrolled
          ? "border-b bg-background/90 shadow-sm"
          : "bg-background/80"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Logo and workspace */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyber-primary/20 to-cyber-accent/10 mr-1 flex items-center justify-center border border-cyber-primary/20 group-hover:border-cyber-primary/40 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              <Zap className="h-5 w-5 text-cyber-primary group-hover:text-cyber-primary/90 transition-all group-hover:scale-110 duration-300" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-bold bg-gradient-to-r from-cyber-primary via-orange-400 to-cyber-accent bg-clip-text text-transparent">
                ALFRED
              </div>
            </div>
          </Link>
          
          {activeWorkspaceId && (
            <>
              <div className="h-6 mx-1 border-r border-border/50"></div>
              <WorkspaceSelector />
            </>
          )}
        </div>
        
        {/* Right side - Core actions only */}
        <div className="flex items-center gap-3">
          {/* Prioritized: Model selection (core feature) */}
          <div className="flex items-center h-8">
            <ModelSelector isCompact={true} onlyAvailable={true} />
          </div>
          
          {/* Primary action - New Chat button */}
          <Button
            size="sm"
            className="rounded-full h-8 gap-1.5 bg-gradient-to-r from-cyber-primary to-cyber-accent text-white hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-300"
            onClick={() => {
              if (activeWorkspaceId) {
                document.getElementById('new-chat-button')?.click();
              }
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">New Chat</span>
          </Button>
          
          {/* Progressive disclosure for additional features */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Theme toggle in dropdown to reduce clutter */}
              <DropdownMenuItem onClick={() => {
                const themeToggle = document.querySelector('[data-theme-toggle]') as HTMLButtonElement;
                if (themeToggle) themeToggle.click();
              }}>
                <div className="mr-2 h-4 w-4 flex items-center justify-center">
                  {/* This will be either a sun or moon icon depending on current theme */}
                  <div className="hidden" data-theme-toggle-container>
                    <ThemeToggle />
                  </div>
                </div>
                <span>Toggle Theme</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => toast({
                title: "Keyboard Shortcuts",
                description: "⌘+K: Focus search • ⌘+N: New chat • ⌘+S: Save chat",
              })}>
                <Command className="mr-2 h-4 w-4" />
                <span>Keyboard Shortcuts</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>AI Features</DropdownMenuLabel>
              
              {/* Document-related options grouped */}
              <DropdownMenuItem onClick={() => {
                document.getElementById('document-manager-trigger')?.click();
              }}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Document Manager</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => {
                const uploadInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (uploadInput) uploadInput.click();
              }}>
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload Document</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/workflow-builder">
                  <Workflow className="mr-2 h-4 w-4" />
                  <span>Workflow Builder</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
