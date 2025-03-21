import React, { useState, useEffect } from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useChat } from '@/context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  LightbulbIcon, 
  Code, 
  PenTool, 
  BookOpen, 
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

export function PromptSuggestions() {
  const { getPersonalizedSuggestions, trackPromptUse, updateFeatureUsage } = useUserPreferences();
  const { sendMessage } = useChat();
  const [suggestions, setSuggestions] = useState<Array<{ type: string; content: string }>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate suggestions when component mounts or is refreshed
  useEffect(() => {
    setSuggestions(getPersonalizedSuggestions());
    
    // Auto show suggestions
    setIsVisible(true);
    
    // Auto hide after 15 seconds if not interacted with
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 15000);
    
    return () => clearTimeout(timeout);
  }, [getPersonalizedSuggestions, refreshKey]);

  // Function to use a suggestion
  const useSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
    trackPromptUse(suggestion);
    updateFeatureUsage('suggestions');
    setIsVisible(false);
  };

  // Get icon based on suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'contextual':
        return <LightbulbIcon className="h-4 w-4 text-amber-500" />;
      case 'coding':
        return <Code className="h-4 w-4 text-blue-500" />;
      case 'writing':
        return <PenTool className="h-4 w-4 text-purple-500" />;
      case 'research':
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case 'dataAnalysis':
        return <BarChart3 className="h-4 w-4 text-cyan-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  // If no suggestions or not visible, don't render
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl z-10 px-4"
      >
        <div className="bg-card border border-border/30 rounded-xl shadow-lg overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/30">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Suggestions</span>
            </div>
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => {
                        setRefreshKey(prev => prev + 1);
                        updateFeatureUsage('refresh_suggestions');
                      }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Refresh suggestions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => setIsVisible(false)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Dismiss</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={`${suggestion.content}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-auto py-2.5 px-3 justify-start text-left text-sm group",
                    "border border-border/30 bg-background/50 hover:bg-accent/20"
                  )}
                  onClick={() => useSuggestion(suggestion.content)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{suggestion.content}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact version for sidebar or other constrained spaces
export function CompactPromptSuggestions() {
  const { getSuggestedPrompts, trackPromptUse } = useUserPreferences();
  const { sendMessage } = useChat();
  const [suggestions] = useState<string[]>(() => getSuggestedPrompts(3));

  return (
    <div className="space-y-1.5 mb-3">
      <h4 className="text-xs font-medium text-muted-foreground px-3">Suggested Prompts</h4>
      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs h-auto py-1.5 px-3"
            onClick={() => {
              sendMessage(suggestion);
              trackPromptUse(suggestion);
            }}
          >
            <Sparkles className="h-3 w-3 mr-2 text-primary" />
            <span className="truncate">{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}