import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface DocumentKnowledgeLayoutProps {
  children: React.ReactNode;
  sidebarOpen?: boolean;
}

export function DocumentKnowledgeLayout({ 
  children,
  sidebarOpen = false
}: DocumentKnowledgeLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(sidebarOpen);
  
  // Listen for sidebar state changes (could come from parent components)
  useEffect(() => {
    setIsSidebarOpen(sidebarOpen);
  }, [sidebarOpen]);

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Make sure content adjusts when sidebar is open/closed */}
      <div 
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          isSidebarOpen ? "ml-[240px]" : "ml-[60px]" // Adjust based on your sidebar width
        )}
      >
        <div className="container mx-auto py-6 max-w-[1200px]">
          {children}
        </div>
      </div>
    </div>
  );
}