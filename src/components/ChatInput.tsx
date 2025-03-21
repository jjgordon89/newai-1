import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  SendHorizontal,
  UploadCloud,
  FileUp
} from 'lucide-react';
import { cn } from "@/lib/utils";

export function ChatInput() {
  const { 
    sendMessage, 
    isLoading, 
    isApiKeySet
  } = useChat();
  
  const { toast } = useToast();
  const { activeWorkspaceId, addDocument } = useWorkspace();
  
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  
  // Character counter
  const maxChars = 4000;
  const charCount = input.length;
  const isAtLimit = charCount >= maxChars;

  useEffect(() => {
    // Auto focus the input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading || !isApiKeySet) return;
    
    sendMessage(input.trim());
    setInput('');
  };
  
  // File upload handlers
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeWorkspaceId) return;
    
    setUploading(true);
    
    // Simulate file upload and processing
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update progress
      setUploadProgress(((i + 1) / files.length) * 100);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add document to workspace
      const docId = Math.random().toString(36).substring(2, 11);
      addDocument(activeWorkspaceId, {
        id: docId,
        name: file.name,
        path: URL.createObjectURL(file)
      });
    }
    
    // Complete upload process
    setUploading(false);
    setUploadProgress(0);
    
    // Show success toast
    toast({
      title: "Documents Added",
      description: `Successfully added ${files.length} document(s) to your knowledge base`,
    });
  };
  
  // Handle input file change
  const handleInputFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event.target.files);
    // Reset file input
    event.target.value = '';
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

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm z-10",
        isDraggingFile && "ring-1 ring-blue-400"
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-3xl mx-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                !isApiKeySet
                  ? "Please set your API key in settings..."
                  : isLoading
                  ? "Thinking..."
                  : "Message Alfred AI..."
              }
              disabled={isLoading || !isApiKeySet}
              className={cn(
                "w-full py-3 px-4 bg-white border border-slate-200 rounded-lg",
                "text-slate-800 placeholder:text-slate-400 focus:outline-none",
                "focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              )}
              maxLength={maxChars}
            />
            
            {/* Upload button */}
            <div className="absolute right-12">
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleInputFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
                  disabled={uploading || isLoading}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={uploading || isLoading}
                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                >
                  <FileUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || !isApiKeySet || isAtLimit}
              className="absolute right-2 p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white disabled:bg-slate-200 disabled:text-slate-400"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-r-transparent" />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* File upload progress */}
          {uploading && (
            <div className="mt-2 space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <UploadCloud className="h-3.5 w-3.5 text-blue-500" />
                  <span>Uploading documents...</span>
                </span>
                <span className="text-xs text-slate-500">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5" />
            </div>
          )}
          
          {/* Info text */}
          {!uploading && (
            <p className="text-xs text-center text-slate-500 mt-2">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Enter</kbd> to send
            </p>
          )}
        </form>
      </div>
      
      {/* File drop indicator */}
      {isDraggingFile && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-50 border-2 border-dashed border-blue-400">
          <div className="flex flex-col items-center gap-2 text-center">
            <UploadCloud className="h-10 w-10 text-blue-500" />
            <p className="text-sm font-medium">Drop files here</p>
          </div>
        </div>
      )}
    </div>
  );
}
