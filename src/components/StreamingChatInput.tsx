import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  SendHorizontal,
  Bot,
  MessageCircle,
  Command,
  ArrowUp,
  Wand2,
  Info,
  Mic,
  FileUp,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  FileCode2,
  AlignLeft,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { modelService } from "@/lib/modelIntegration";

const MAX_TEXTAREA_HEIGHT = 200; // Maximum height for the textarea in pixels

export function StreamingChatInput() {
  const {
    sendMessage,
    isLoading,
    activeThreadId,
    activeModel,
    ragEnabled,
    webSearchEnabled,
  } = useChat();

  const { toast } = useToast();

  // Form state
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formattingBarRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFormattingBar, setShowFormattingBar] = useState(false);

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");

  // Sample suggestions
  const suggestions = [
    "What is retrieval-augmented generation?",
    "Write a short story about a cybernetic detective",
    "Summarize the concept of quantum computing",
    "How does GPT-4 compare to previous models?",
    "Explain the difference between REST and GraphQL",
  ];

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = "auto";

    // Calculate new height based on scrollHeight, with a maximum
    const newHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${newHeight}px`;

    // Add scrollbar if content exceeds max height
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [input]);

  // Initialize with keyboard shortcuts and auto-focus
  useEffect(() => {
    // Auto focus the textarea on component mount
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Add keyboard shortcuts
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      // Cmd/Ctrl + / to show suggestions
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowSuggestions((prev) => !prev);
      }

      // Cmd/Ctrl + B for bold
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        insertFormatting("**", "**");
      }

      // Cmd/Ctrl + I for italic
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        insertFormatting("*", "*");
      }

      // Cmd/Ctrl + K for link
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        insertFormatting("[", "](url)");
      }

      // Cmd/Ctrl + Shift + C for code
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        insertFormatting("`", "`");
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, [activeThreadId]);

  // Handle form submission with streaming
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;

    // Prepare message text
    let messageText = input.trim();
    if (attachments.length > 0) {
      const attachmentNames = attachments.map((file) => file.name).join(", ");
      messageText += `\n\n(Attached files: ${attachmentNames})`;
    }

    // Clear input and attachments
    setInput("");
    setAttachments([]);
    setShowSuggestions(false);
    setShowFormattingBar(false);

    try {
      // Send the message to the chat context
      await sendMessage(messageText);

      // Start streaming if the model supports it
      if (activeModel && activeModel.id) {
        // This would be implemented in a real app
        // Here we're just simulating streaming for demonstration
        simulateStreaming(messageText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Simulate streaming response (in a real app, this would use the modelService)
  const simulateStreaming = (userMessage: string) => {
    setIsStreaming(true);
    setStreamedResponse("");

    // In a real implementation, you would use modelService.generateStreamingCompletion
    // For demo purposes, we'll simulate a streaming response
    const words =
      `I'm generating a streaming response to your message about "${userMessage.substring(0, 20)}...". This simulates how the real-time streaming would work with the actual API integration.`.split(
        " ",
      );

    let index = 0;
    const interval = setInterval(() => {
      if (index < words.length) {
        setStreamedResponse((prev) => prev + " " + words[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 100);

    return () => clearInterval(interval);
  };

  // Handle keyboard in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }

    // Toggle formatting bar on focus
    if (e.key === "Tab" && isFocused) {
      e.preventDefault();
      setShowFormattingBar((prev) => !prev);
    }
  };

  // Insert a suggestion into the input
  const insertSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Insert formatting into the input at cursor position
  const insertFormatting = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = input.substring(selectionStart, selectionEnd);

    const textBefore = input.substring(0, selectionStart);
    const textAfter = input.substring(selectionEnd);

    // Insert formatting around selected text, or just insert with cursor in middle
    const newText = selectedText
      ? `${textBefore}${prefix}${selectedText}${suffix}${textAfter}`
      : `${textBefore}${prefix}${suffix}${textAfter}`;

    setInput(newText);

    // Set cursor position inside the formatting markers if no text was selected
    setTimeout(() => {
      if (!selectedText && textarea) {
        const newCursorPos = selectionStart + prefix.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle file uploads
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Add files to attachments
    const newAttachments = Array.from(files);
    setAttachments((prev) => [...prev, ...newAttachments]);

    // Show a toast notification
    toast({
      title: "Files attached",
      description: `${files.length} file(s) attached to your message`,
    });
  };

  // Remove an attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle input file change
  const handleInputFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleFileUpload(event.target.files);
    // Reset file input
    event.target.value = "";
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  // Calculate character limit indicators
  const maxChars = 4000;
  const charCount = input.length;
  const charPercentage = Math.min(100, (charCount / maxChars) * 100);
  const isApproachingLimit = charCount > maxChars * 0.8;
  const isAtLimit = charCount >= maxChars;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pb-6 border-t border-border/40 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md z-10 ml-16 md:ml-16",
        isDraggingFile && "ring-2 ring-primary ring-offset-background",
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-3xl mx-auto">
        {/* Streaming response preview */}
        {isStreaming && streamedResponse && (
          <div className="mb-4 p-3 bg-card/80 border border-border/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30"
              >
                <Bot className="h-3 w-3 mr-1" />
                <span className="text-xs">Streaming Response</span>
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {streamedResponse}
              <span className="animate-pulse">▋</span>
            </div>
          </div>
        )}

        {/* Condensed badges - only show the most important status */}
        <div className="flex items-center justify-between mb-3">
          {/* Left side: Active model - most important context */}
          <div className="flex items-center">
            <Badge
              variant="outline"
              className="bg-secondary/30 text-foreground flex items-center gap-1.5 shadow-sm h-7 border-secondary/30 px-3"
            >
              <Bot className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {activeModel?.name || "AI Assistant"}
              </span>
            </Badge>
          </div>

          {/* Right side: Optional features in dropdown for progressive disclosure */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1.5 bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground"
              >
                <span>Features</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
              <div className="space-y-1.5">
                {activeThreadId && (
                  <Badge
                    variant="outline"
                    className="bg-accent/10 border-accent/30 text-accent-foreground flex items-center gap-1.5 px-2 shadow-sm h-6 w-full justify-start"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="text-xs">Thread Reply Active</span>
                  </Badge>
                )}

                {ragEnabled && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 border-primary/30 text-primary flex items-center gap-1.5 px-2 shadow-sm h-6 w-full justify-start"
                  >
                    <span className="text-xs">Knowledge Base Active</span>
                  </Badge>
                )}

                {webSearchEnabled && (
                  <Badge
                    variant="outline"
                    className="bg-cyber-primary/10 border-cyber-primary/30 text-cyber-primary flex items-center gap-1.5 px-2 shadow-sm h-6 w-full justify-start"
                  >
                    <span className="text-xs">Web Search Active</span>
                  </Badge>
                )}

                <div className="pt-1 mt-1 border-t border-border/30 text-xs text-muted-foreground flex items-center gap-1.5 px-1">
                  <Command className="h-3.5 w-3.5" />
                  <span>Cmd+/ for suggestions</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Simplified formatting toolbar - only shown when explicitly triggered */}
        {showFormattingBar && (
          <div
            ref={formattingBarRef}
            className="bg-muted/80 backdrop-blur-sm rounded-lg p-1.5 mb-2 border border-border/50 flex items-center justify-between shadow-sm"
          >
            {/* Show only the most common formatting options */}
            <div className="flex items-center gap-1">
              {/* Most used formatting options directly visible */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md"
                      onClick={() => insertFormatting("**", "**")}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold (⌘+B)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md"
                      onClick={() => insertFormatting("*", "*")}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic (⌘+I)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md"
                      onClick={() => insertFormatting("`", "`")}
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Inline Code</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Advanced formatting in dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-md text-xs gap-1.5 bg-muted/50"
                  >
                    <span>More</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs gap-1.5"
                      onClick={() => insertFormatting("```\n", "\n```")}
                    >
                      <FileCode2 className="h-3.5 w-3.5" />
                      <span>Code Block</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs gap-1.5"
                      onClick={() => insertFormatting("[", "](url)")}
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span>Link (⌘+K)</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs gap-1.5"
                      onClick={() => insertFormatting("- ", "")}
                    >
                      <List className="h-3.5 w-3.5" />
                      <span>Bullet List</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs gap-1.5"
                      onClick={() => insertFormatting("1. ", "")}
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                      <span>Numbered List</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowFormattingBar(false)}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main chat input form */}
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={cn(
              "group transition-all duration-200 rounded-xl",
              isFocused ? "shadow-[0_0_0_4px_rgba(249,115,22,0.1)]" : "",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 blur-md transition-all duration-300",
                isFocused
                  ? "from-cyber-primary/30 to-accent/20 opacity-100"
                  : "from-cyber-primary/20 to-accent/10 group-hover:opacity-70",
              )}
            />

            {/* Attachments preview area */}
            {attachments.length > 0 && (
              <div className="relative z-10 mb-2 p-2 rounded-t-xl bg-card/60 backdrop-blur-sm border border-border/30 space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">
                    Attachments ({attachments.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-xs"
                    onClick={() => setAttachments([])}
                  >
                    Clear all
                  </Button>
                </div>

                <ScrollArea className="max-h-24">
                  <div className="space-y-1 pr-4">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-1.5 rounded bg-muted/50 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="truncate">{file.name}</span>
                          <span className="text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full hover:bg-background"
                          onClick={() => removeAttachment(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
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
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Textarea and actions */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsFocused(true);
                  // Show formatting bar when user starts typing
                  if (input.length > 0) {
                    setShowFormattingBar(true);
                  }
                }}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  isLoading
                    ? "Thinking..."
                    : activeThreadId
                      ? "Reply to thread..."
                      : "Message AI Assistant..."
                }
                disabled={isLoading}
                className={cn(
                  "resize-none pr-14 rounded-xl shadow-sm relative bg-card z-10 transition-all duration-200 min-h-[60px]",
                  "border-2 focus-visible:ring-0 overflow-auto",
                  attachments.length > 0 ? "rounded-t-none border-t-0" : "",
                  isFocused
                    ? "border-cyber-primary/50"
                    : "border-border/50 hover:border-border",
                )}
                style={{
                  height: "auto",
                  minHeight: "60px",
                  maxHeight: `${MAX_TEXTAREA_HEIGHT}px`,
                }}
                maxLength={maxChars}
              />

              {/* Character counter */}
              {input.length > 0 && (
                <div
                  className={cn(
                    "absolute right-14 bottom-3 text-xs px-1.5 py-0.5 rounded-md transition-colors",
                    isAtLimit
                      ? "bg-destructive/10 text-destructive"
                      : isApproachingLimit
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  {charCount}/{maxChars}
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {/* Attachment and mic buttons */}
                {!isLoading && (
                  <>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={handleInputFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={uploading}
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                        title="Attach files"
                      >
                        <FileUp className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        toast({
                          title: "Speech input",
                          description:
                            "Speech input functionality is not implemented in this demo",
                        });
                      }}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowFormattingBar((prev) => !prev)}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Send button */}
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    (!input.trim() && attachments.length === 0) ||
                    isLoading ||
                    isAtLimit
                  }
                  className={cn(
                    "h-10 w-10 rounded-full transition-all duration-300",
                    (input.trim() || attachments.length > 0) &&
                      !isLoading &&
                      !isAtLimit
                      ? "bg-gradient-to-r from-cyber-primary to-cyber-accent hover:shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-r-transparent" />
                  ) : (
                    <SendHorizontal className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Suggestions popover/dropdown */}
          <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
            <PopoverTrigger className="sr-only">Suggestions</PopoverTrigger>
            <PopoverContent
              className="w-full max-w-md p-0 shadow-lg border-border/50"
              align="center"
              side="top"
              alignOffset={-40}
              sideOffset={8}
            >
              <div className="flex items-center justify-between p-2 bg-muted/50 border-b border-border/30">
                <span className="text-xs font-medium flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5 text-cyber-primary" />
                  Suggested Prompts
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => setShowSuggestions(false)}
                >
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="p-1.5 grid gap-1">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-auto py-2 px-2 justify-start font-normal text-left text-sm hover:bg-accent/10"
                    onClick={() => insertSuggestion(suggestion)}
                  >
                    <div className="flex gap-2 items-center">
                      <div className="bg-accent/10 text-accent h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                        <ArrowUp className="h-3 w-3" />
                      </div>
                      <span className="truncate">{suggestion}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </form>

        {/* Helper text */}
        {!uploading && (
          <p className="text-xs text-center text-muted-foreground mt-2.5 px-2">
            {activeThreadId ? (
              "Replying in thread - Press Enter to send"
            ) : (
              <span className="flex items-center justify-center gap-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                  Enter
                </kbd>
                <span>to send,</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                  Shift+Enter
                </kbd>
                <span>for new line,</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                  Tab
                </kbd>
                <span>for formatting</span>
              </span>
            )}
          </p>
        )}

        {/* File drop indicator */}
        {isDraggingFile && (
          <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl z-50 border-2 border-dashed border-primary">
            <div className="flex flex-col items-center gap-2 text-center">
              <FileUp className="h-10 w-10 text-primary" />
              <p className="text-lg font-medium">Drop files here</p>
              <p className="text-sm text-muted-foreground">
                Files will be attached to your message
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
