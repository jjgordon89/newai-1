import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookText, Save } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

const NOTE_STORAGE_KEY = 'workspace_notes';

interface NotesProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotesSection: React.FC<NotesProps> = ({ isOpen, onClose }) => {
  const { activeWorkspaceId } = useWorkspace();
  const [notes, setNotes] = useState<string>('');
  const { toast } = useToast();
  
  // Load notes for this workspace when opened
  useEffect(() => {
    if (isOpen && activeWorkspaceId) {
      loadNotes();
    }
  }, [isOpen, activeWorkspaceId]);
  
  // Load notes from local storage
  const loadNotes = () => {
    if (!activeWorkspaceId) return;
    
    try {
      const storedNotes = localStorage.getItem(NOTE_STORAGE_KEY);
      if (storedNotes) {
        const allNotes = JSON.parse(storedNotes);
        setNotes(allNotes[activeWorkspaceId] || '');
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };
  
  // Save notes to local storage
  const saveNotes = () => {
    if (!activeWorkspaceId) return;
    
    try {
      // Get existing notes
      const storedNotes = localStorage.getItem(NOTE_STORAGE_KEY);
      const allNotes = storedNotes ? JSON.parse(storedNotes) : {};
      
      // Update notes for current workspace
      allNotes[activeWorkspaceId] = notes;
      
      // Save back to local storage
      localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(allNotes));
      
      toast({
        title: "Notes Saved",
        description: "Your notes have been saved for this workspace"
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      });
    }
  };
  
  // Auto-save when sheet is closed
  const handleClose = () => {
    saveNotes();
    onClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <BookText className="h-5 w-5" />
            <span>Workspace Notes</span>
          </SheetTitle>
          <SheetDescription>
            Take notes for your current workspace. Notes are automatically saved when you close this panel.
          </SheetDescription>
        </SheetHeader>
        
        <div className="h-[calc(100vh-180px)]">
          <ScrollArea className="h-full pr-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Start typing your notes here..."
              className="min-h-[300px] resize-none border-muted"
            />
          </ScrollArea>
        </div>
        
        <SheetFooter className="mt-4">
          <Button onClick={saveNotes} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Notes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NotesSection;