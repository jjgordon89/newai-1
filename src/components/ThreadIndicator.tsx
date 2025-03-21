
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronRight, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreadIndicatorProps {
  hasThread: boolean;
  isParentMessage?: boolean;
  onClick: () => void;
  className?: string;
}

export function ThreadIndicator({ 
  hasThread, 
  isParentMessage,
  onClick, 
  className 
}: ThreadIndicatorProps) {
  if (isParentMessage) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("text-muted-foreground hover:text-foreground flex items-center gap-1", className)}
        onClick={onClick}
      >
        <CornerDownLeft className="h-4 w-4" />
        <span>Exit Thread</span>
      </Button>
    );
  }
  
  if (hasThread) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("text-primary hover:text-primary/80 flex items-center gap-1", className)}
        onClick={onClick}
      >
        <MessageCircle className="h-4 w-4" />
        <span>View Replies</span>
        <ChevronRight className="h-3 w-3" />
      </Button>
    );
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("text-muted-foreground hover:text-primary flex items-center gap-1", className)}
      onClick={onClick}
    >
      <MessageCircle className="h-4 w-4" />
      <span>Create Thread</span>
    </Button>
  );
}
