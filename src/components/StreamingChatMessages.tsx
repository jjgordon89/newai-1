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

export function StreamingChatMessages() {
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
  
  // Streaming state
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Scroll to bottom on new messages or streaming updates
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage, isStreaming]);

  // Find messages with RAG context and their threading status
  const messagesWithContext = messages.map((message, index) => {
    // If we're in a thread view an