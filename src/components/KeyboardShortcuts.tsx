import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { X } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

export const shortcutGroups: ShortcutGroup[] = [
  {
    title: "General",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close any open dialog" },
      { keys: ["Ctrl", "K"], description: "Search" },
      { keys: ["Ctrl", "/"], description: "Focus on chat input" },
    ]
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "P"], description: "Access profile settings" },
      { keys: ["Ctrl", "S"], description: "Open settings" },
      { keys: ["Ctrl", "D"], description: "Open document manager" },
      { keys: ["Ctrl", "Tab"], description: "Switch between workspaces" },
    ]
  },
  {
    title: "Content",
    shortcuts: [
      { keys: ["Ctrl", "N"], description: "New thread" },
      { keys: ["Ctrl", "Shift", "C"], description: "Copy message to clipboard" },
      { keys: ["Ctrl", "Enter"], description: "Send message" },
      { keys: ["Alt", "Up/Down"], description: "Navigate through message history" },
    ]
  }
];

interface KeyboardShortcutsProps {
  inline?: boolean;
}

export function KeyboardShortcuts({ inline = false }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (inline) return; // Skip event listener if in inline mode
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts dialog when ? is pressed (or Shift+?)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsOpen(true);
      }

      // Handle Escape key to close the dialog
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inline]);

  // Render the content
  const ShortcutsContent = () => (
    <div className="space-y-6">
      {shortcutGroups.map((group, i) => (
        <div key={i} className="space-y-3">
          <h3 className="text-lg font-medium">{group.title}</h3>
          <div className="grid grid-cols-1 gap-2">
            {group.shortcuts.map((shortcut, j) => (
              <div 
                key={j} 
                className="flex items-center justify-between py-2 px-3 rounded-md odd:bg-muted/50"
              >
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, k) => (
                    <React.Fragment key={k}>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded-md">
                        {key}
                      </kbd>
                      {k < shortcut.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {!inline && (
        <div className="mt-4 text-sm text-muted-foreground border-t pt-4">
          <p>Press <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded-md">?</kbd> at any time to show this dialog.</p>
        </div>
      )}
    </div>
  );

  // If in inline mode, return the content directly
  if (inline) {
    return <ShortcutsContent />;
  }

  // Otherwise return as a dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            Keyboard Shortcuts
            <button 
              onClick={() => setIsOpen(false)} 
              className="rounded-full p-1 hover:bg-muted"
            >
              <X size={18} />
            </button>
          </DialogTitle>
          <DialogDescription>
            Keyboard shortcuts to help you navigate and use the application more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <ShortcutsContent />
      </DialogContent>
    </Dialog>
  );
}