import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

interface UserPreferences {
  theme: Theme;
  language: Language;
  enableNotifications: boolean;
  enableSoundEffects: boolean;
  saveConversationHistory: boolean;
  autoSuggest: boolean;
  defaultModelId: string;
  defaultEmbeddingModel: string;
  apiKeys: {
    openai?: string;
    anthropic?: string;
    huggingface?: string;
    mistral?: string;
    google?: string;
  };
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updateTheme: (theme: Theme) => void;
  updateLanguage: (language: Language) => void;
  toggleNotifications: () => void;
  toggleSoundEffects: () => void;
  toggleSaveHistory: () => void;
  toggleAutoSuggest: () => void;
  updateApiKey: (provider: keyof UserPreferences['apiKeys'], key: string) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  enableNotifications: true,
  enableSoundEffects: true,
  saveConversationHistory: true,
  autoSuggest: true,
  defaultModelId: 'gpt-4',
  defaultEmbeddingModel: 'text-embedding-3-small',
  apiKeys: {}
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Load preferences from localStorage if available
    const savedPrefs = localStorage.getItem('alfred-preferences');
    return savedPrefs ? JSON.parse(savedPrefs) : defaultPreferences;
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('alfred-preferences', JSON.stringify(preferences));
    
    // Apply theme to document
    if (preferences.theme === 'dark' || 
        (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Listen for system theme changes if using system theme
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [preferences]);

  const updateTheme = (theme: Theme) => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  const updateLanguage = (language: Language) => {
    setPreferences(prev => ({ ...prev, language }));
  };

  const toggleNotifications = () => {
    setPreferences(prev => ({ ...prev, enableNotifications: !prev.enableNotifications }));
  };

  const toggleSoundEffects = () => {
    setPreferences(prev => ({ ...prev, enableSoundEffects: !prev.enableSoundEffects }));
  };

  const toggleSaveHistory = () => {
    setPreferences(prev => ({ ...prev, saveConversationHistory: !prev.saveConversationHistory }));
  };

  const toggleAutoSuggest = () => {
    setPreferences(prev => ({ ...prev, autoSuggest: !prev.autoSuggest }));
  };

  const updateApiKey = (provider: keyof UserPreferences['apiKeys'], key: string) => {
    setPreferences(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: key
      }
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        updateTheme,
        updateLanguage,
        toggleNotifications,
        toggleSoundEffects,
        toggleSaveHistory,
        toggleAutoSuggest,
        updateApiKey,
        resetPreferences
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  
  return context;
};