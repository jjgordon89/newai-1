import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  iconOnly?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ iconOnly = true }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Set up theme detection
  useEffect(() => {
    setMounted(true);
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Check if dark mode is stored in localStorage
    const storedTheme = localStorage.getItem('theme');
    
    const isDarkMode = storedTheme === 'dark' ||
      (!storedTheme && prefersDark);
    
    setIsDark(isDarkMode);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);
  
  if (!mounted) {
    return <Button variant="ghost" size={iconOnly ? "icon" : "sm"} disabled>
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      {!iconOnly && <span className="ml-2">Theme</span>}
    </Button>;
  }

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Store theme preference
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', newIsDark);
  };

  return (
    <Button
      variant="ghost"
      size={iconOnly ? "icon" : "sm"}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="h-9"
    >
      {isDark ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      {!iconOnly && <span className="ml-2">{isDark ? 'Dark' : 'Light'}</span>}
    </Button>
  );
};