import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@/context/ChatContext";
import ReactMarkdown from "react-markdown";
import {
  User,
  Bot,
  MessageCircle,
  ArrowLeft,
  PanelRight,
  Copy,
  CheckCircle2,
  Clock,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RagSources } from "./RagSources";
import { ThreadIndicator } from "./ThreadIndicator";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";

export function ChatMessages() {
  const {
    messages,
    isLoading,
    startThread,
    exitThread,
    activeThreadId,
    activeModel,
    sendMessage,
  } = useChat();
  const endRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  // Add state for collapsible messages
  const [collapsedMessages, setCollapsedMessages] = useState<Set<string>>(
    new Set(),
  );
  // Add state for compact view
  const [compactView, setCompactView] = useState<boolean>(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Find messages with RAG context and their threading status
  const messagesWithContext = messages.map((message, index) => {
    // If we're in a thread view and this is the parent message
    const isParentMessage = activeThreadId === message.id;

    return {
      ...message,
      isParentMessage,
      // Ensure sources exists for TypeScript
      sources: (message as any).sources || [],
    };
  });

  // Toggle collapse state for a message
  const toggleMessageCollapse = (messageId: string) => {
    setCollapsedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Collapse all messages except the last few
  const collapseOlderMessages = () => {
    const messagesToKeep = 3; // Keep the last 3 messages expanded
    const messageIds = new Set<string>();

    // Get IDs of all messages except the last few
    messages
      .slice(0, Math.max(0, messages.length - messagesToKeep))
      .filter((m) => m.role !== "system")
      .forEach((m) => messageIds.add(m.id));

    setCollapsedMessages(messageIds);
  };

  // Copy message content to clipboard
  const copyMessageContent = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
      duration: 2000,
    });

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  return (
    <div className="px-4 py-2 overflow-y-auto flex-1 pb-32 chat-scroll-area">
      <div className="max-w-3xl mx-auto space-y-6">
        {activeThreadId && (
          <div className="sticky top-0 z-20 flex items-center justify-between p-3 mb-4 rounded-lg bg-card/90 backdrop-blur-md border border-border/40">
            <h3 className="text-sm font-medium flex items-center gap-2 text-cyber-primary">
              <MessageCircle className="h-4 w-4" />
              <span>Thread View</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-border/50"
              onClick={exitThread}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Exit Thread
            </Button>
          </div>
        )}

        {/* View controls for messages when we have messages */}
        {messages.length > 0 && !activeThreadId && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 border-border/30"
                onClick={collapseOlderMessages}
              >
                <span>Collapse Older</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setCollapsedMessages(new Set())}
              >
                <span>Expand All</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setCompactView(!compactView)}
            >
              <span>{compactView ? "Detailed View" : "Compact View"}</span>
            </Button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyber-primary/30 to-cyber-primary/5 flex items-center justify-center border border-cyber-primary/30 shadow-[0_0_30px_rgba(249,115,22,0.2)] mb-6">
              <Bot className="h-8 w-8 text-cyber-primary" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyber-primary via-orange-400 to-cyber-accent bg-clip-text text-transparent mb-3">
              Alfred AI Assistant
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Type a message to start a conversation with your AI assistant
              powered by {activeModel?.name || "advanced AI"}.
            </p>
          </div>
        ) : (
          messagesWithContext.map((message) => {
            if (message.role === "system") return null;

            const isAssistant = message.role === "assistant";

            return (
              <div
                key={message.id}
                className={cn(
                  "group flex items-start gap-3 rounded-lg transition-all duration-200",
                  // Apply different padding based on collapsed state
                  collapsedMessages.has(message.id) ? "p-2" : "p-4",
                  // Simplified backgrounds with reduced visual noise
                  isAssistant
                    ? "bg-card/80 border border-border/20"
                    : "bg-transparent hover:bg-muted/10 border border-transparent",
                  message.isParentMessage && "border-l-2 border-cyber-primary",
                  // Apply compact styling if enabled
                  compactView && "py-2",
                )}
                // Allow expanding by clicking on collapsed messages
                onClick={() =>
                  collapsedMessages.has(message.id) &&
                  toggleMessageCollapse(message.id)
                }
              >
                {isAssistant ? (
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyber-primary/20 to-cyber-primary/5 flex items-center justify-center border border-cyber-primary/20">
                    <Bot className="h-5 w-5 text-cyber-primary" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center border border-border/30">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium text-sm",
                          isAssistant
                            ? "text-cyber-primary"
                            : "text-foreground",
                        )}
                      >
                        {isAssistant ? "Alfred AI" : "You"}
                      </span>

                      {isAssistant &&
                        message.sources &&
                        message.sources.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4 font-normal bg-primary/5 border-primary/20 text-primary gap-1"
                          >
                            <PanelRight className="h-2.5 w-2.5" />
                            Sources
                          </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          message.timestamp || Date.now(),
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {/* Add collapsible toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMessageCollapse(message.id);
                        }}
                      >
                        {collapsedMessages.has(message.id) ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyMessageContent(message.content, message.id);
                              }}
                            >
                              {copiedMessageId === message.id ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">Copy message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Show condensed or full content based on collapsed state */}
                  {collapsedMessages.has(message.id) ? (
                    <div className="text-sm text-muted-foreground italic">
                      {message.content.length > 75
                        ? message.content.substring(0, 75) + "..."
                        : message.content}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "prose dark:prose-invert max-w-none",
                        // Reduced vertical spacing in compact mode
                        compactView
                          ? "prose-p:my-1 prose-headings:my-2"
                          : "prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-pre:my-2",
                        // Common styles with simplified colors
                        "prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
                        "prose-a:text-cyber-primary prose-a:no-underline hover:prose-a:underline",
                        // Simplified color scheme
                        isAssistant
                          ? "prose-code:bg-primary/5 prose-code:text-primary prose-pre:bg-card/50 prose-pre:border prose-pre:border-border/30"
                          : "prose-code:bg-muted prose-code:text-muted-foreground prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/30",
                        isAssistant
                          ? "prose-headings:text-primary/90"
                          : "prose-headings:text-foreground",
                      )}
                    >
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 mb-1">
                      <RagSources sources={message.sources} />
                    </div>
                  )}

                  {!activeThreadId && message.role === "user" && (
                    <div className="mt-2">
                      <ThreadIndicator
                        hasThread={!!message.hasThread}
                        onClick={() => startThread(message.id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-start gap-3 rounded-lg bg-card/60 p-4 border border-border/10 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyber-primary/10 to-cyber-primary/5 flex items-center justify-center border border-cyber-primary/10 animate-pulse">
              <Bot className="h-5 w-5 text-cyber-primary/70" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-20 bg-muted/70 animate-pulse rounded-full"></div>
                <Badge
                  variant="outline"
                  className="h-5 animate-pulse bg-primary/5 border-primary/10"
                >
                  <Clock className="h-3 w-3 text-primary/70 mr-1" />
                  <span className="text-xs font-normal">Thinking...</span>
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted/60 animate-pulse rounded-full w-full"></div>
                <div className="h-4 bg-muted/60 animate-pulse rounded-full w-5/6"></div>
                <div className="h-4 bg-muted/60 animate-pulse rounded-full w-4/6"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} className="h-4" />
      </div>
    </div>
  );
}
