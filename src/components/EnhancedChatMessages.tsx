import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { Remarkable } from "remarkable";
import RemarkableReactRenderer from "remarkable-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
  ArrowDown,
  CircleCheck,
  CircleDot,
  CircleDashed,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
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
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Initialize Remarkable with desired options
const md = new Remarkable({
  html: true,
  xhtmlOut: true,
  breaks: true,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
});

// Configure the renderer
const remarkableReact = new RemarkableReactRenderer({
  components: {
    code: ({ children, language }) => {
      // For inline code
      if (!language) {
        return <code>{children}</code>;
      }

      // For code blocks
      return (
        <div className="rounded-md border border-primary/20 !my-3">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      );
    },
  },
});

// Status indicator for messages
const MessageStatus = ({ timestamp, isDelivered = true, isRead = false }) => {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {format(new Date(timestamp || Date.now()), "h:mm a")}
      {isDelivered && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {isRead ? (
                <CircleCheck className="h-3 w-3 text-green-500" />
              ) : (
                <CircleCheck className="h-3 w-3 text-muted-foreground" />
              )}
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isRead ? "Read" : "Delivered"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export function EnhancedChatMessages() {
  const {
    messages,
    isLoading,
    startThread,
    exitThread,
    activeThreadId,
    activeModel,
    sendMessage,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Show/hide scroll button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollAreaRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      setShowScrollButton(!isNearBottom);
    };

    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll);
      return () => scrollArea.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Find messages with RAG context and their threading status
  const messagesWithContext = messages.map((message, index) => {
    // If we're in a thread view and this is the parent message
    const isParentMessage = activeThreadId === message.id;

    return {
      ...message,
      isParentMessage,
      // Add status indicators - these would normally come from a real system
      deliveryStatus: {
        isDelivered: true,
        isRead: index < messages.length - 2, // All except the last 2 messages are "read"
        timestamp: message.timestamp,
      },
    };
  });

  // Copy message content to clipboard
  const copyMessageContent = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied",
      duration: 2000,
    });

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Render markdown content
  const renderMarkdown = (content) => {
    // Create a new instance with the renderer already applied
    const mdWithRenderer = new Remarkable({
      html: true,
      xhtmlOut: true,
      breaks: true,
      langPrefix: "language-",
      linkify: true,
      typographer: true,
    });
    mdWithRenderer.renderer = remarkableReact;
    return mdWithRenderer.render(content);
  };

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden">
      <ScrollArea className="flex-1 px-4 py-2" ref={scrollAreaRef as any}>
        <div className="max-w-4xl mx-auto space-y-8 pb-36">
          {activeThreadId && (
            <div className="sticky top-0 z-20 flex items-center justify-between p-5 mb-6 rounded-xl bg-card/90 backdrop-blur-md border-2 border-border/50 shadow-md">
              <h3 className="text-base font-medium flex items-center gap-3 text-cyber-primary">
                <MessageCircle className="h-5 w-5" />
                <span>Thread View</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-sm gap-2 border-border/60 shadow-sm hover:bg-background/80 hover:text-cyber-primary transition-all duration-200"
                onClick={exitThread}
              >
                <ArrowLeft className="h-4 w-4" />
                Exit Thread
              </Button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyber-primary/30 to-cyber-primary/5 flex items-center justify-center border border-cyber-primary/30 shadow-[0_0_30px_rgba(249,115,22,0.2)] mb-6">
                <Zap className="h-8 w-8 text-cyber-primary" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyber-primary via-orange-400 to-cyber-accent bg-clip-text text-transparent mb-3">
                Welcome to Alfred AI
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start a conversation with your AI assistant powered by{" "}
                {activeModel?.name || "advanced AI"}. Ask questions, brainstorm
                ideas, or get help with various tasks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <SamplePrompt
                  text="Explain quantum computing in simple terms"
                  icon={
                    <ArrowUpRight className="h-3.5 w-3.5 text-cyber-primary" />
                  }
                />
                <SamplePrompt
                  text="Write a creative short story about robots"
                  icon={
                    <ArrowUpRight className="h-3.5 w-3.5 text-cyber-primary" />
                  }
                />
                <SamplePrompt
                  text="Help me design a fitness plan for beginners"
                  icon={
                    <ArrowUpRight className="h-3.5 w-3.5 text-cyber-primary" />
                  }
                />
                <SamplePrompt
                  text="What are the most promising AI technologies in 2025?"
                  icon={
                    <ArrowUpRight className="h-3.5 w-3.5 text-cyber-primary" />
                  }
                />
              </div>
            </div>
          ) : (
            messagesWithContext.map((message) => {
              if (message.role === "system") return null;

              const isAssistant = message.role === "assistant";
              const messageDate = new Date(message.timestamp || Date.now());

              return (
                <div
                  key={message.id}
                  className={cn(
                    "group relative flex gap-4 rounded-xl p-5 transition-all duration-200",
                    isAssistant
                      ? "bg-gradient-to-r from-card/95 to-card/60 shadow-md border border-border/20 ml-5"
                      : "bg-primary/10 shadow-md border border-primary/20 mr-5 justify-end",
                    message.isParentMessage &&
                      "border-l-3 border-cyber-primary shadow-[0_0_15px_rgba(249,115,22,0.15)]",
                  )}
                >
                  {/* Avatar for user or assistant */}
                  {isAssistant ? (
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyber-primary/20 to-cyber-primary/5 flex items-center justify-center border border-cyber-primary/20 shrink-0">
                      <Bot className="h-5 w-5 text-cyber-primary" />
                    </div>
                  ) : (
                    <div className="order-2 ml-3 w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}

                  {/* Message content */}
                  <div
                    className={cn(
                      "flex-1 overflow-hidden",
                      !isAssistant && "order-1",
                    )}
                  >
                    {/* Message header */}
                    <div
                      className={cn(
                        "flex justify-between items-center mb-1.5",
                        !isAssistant && "flex-row-reverse",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium text-sm",
                            isAssistant ? "text-cyber-primary" : "text-primary",
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

                      <div
                        className={cn(
                          "flex items-center gap-1.5",
                          !isAssistant && "flex-row-reverse",
                        )}
                      >
                        {/* Enhanced timestamp with delivery status */}
                        <MessageStatus
                          timestamp={messageDate}
                          isDelivered={message.deliveryStatus.isDelivered}
                          isRead={message.deliveryStatus.isRead}
                        />

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  copyMessageContent(
                                    message.content,
                                    message.id,
                                  )
                                }
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

                    {/* Message content with Remarkable markdown */}
                    <div className="markdown-content">
                      <div
                        className={cn(
                          "prose dark:prose-invert max-w-none prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-pre:my-2",
                          "prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
                          "prose-a:text-cyber-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-cyber-primary prose-headings:text-foreground",
                          isAssistant
                            ? "prose-code:bg-cyber-primary/10 prose-code:text-cyber-primary prose-pre:bg-card/90 prose-pre:border-0 prose-pre:shadow-sm"
                            : "prose-code:bg-primary/10 prose-code:text-primary prose-pre:bg-primary/5 prose-pre:border-0",
                          isAssistant
                            ? "prose-h1:text-cyber-primary prose-h2:text-cyber-primary/90 prose-h3:text-cyber-primary/80"
                            : "",
                        )}
                      >
                        {renderMarkdown(message.content)}
                      </div>
                    </div>

                    {/* Message sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 mb-1">
                        <RagSources sources={message.sources} />
                      </div>
                    )}

                    {/* Thread indicator */}
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

          {/* Loading message indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 rounded-lg bg-card/60 p-4 border border-border/10 shadow-sm ml-4">
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
                    <span className="text-xs font-normal">Typing...</span>
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

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-20 right-6 h-10 w-10 rounded-full shadow-md border border-border/50 z-10 animate-bounce-slow"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

function SamplePrompt({
  text,
  icon,
}: {
  text: string;
  icon?: React.ReactNode;
}) {
  const { sendMessage } = useChat();

  return (
    <button
      onClick={() => sendMessage(text)}
      className="group p-4 text-left text-sm bg-muted/60 hover:bg-muted/90 border-2 border-border/40 hover:border-cyber-primary/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyber-primary/30"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyber-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex justify-between items-center gap-3">
        <span className="relative z-10 font-medium">{text}</span>
        {icon && (
          <span className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 bg-cyber-primary/10 rounded-full">
            {icon}
          </span>
        )}
      </div>
    </button>
  );
}
