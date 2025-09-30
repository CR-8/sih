'use client';

import React, { createContext, useContext } from 'react';

export interface AITheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    base: string;
    container: string;
  };
}

const AIThemeContext = createContext<AITheme | null>(null);

interface AIThemeProviderProps {
  theme: AITheme;
  children: React.ReactNode;
}

export const AIThemeProvider = ({ theme, children }: AIThemeProviderProps) => {
  return (
    <AIThemeContext.Provider value={theme}>
      <div 
        className="ai-themed"
        style={{
          '--ai-primary': theme.colors.primary,
          '--ai-secondary': theme.colors.secondary,
          '--ai-accent': theme.colors.accent,
          '--ai-background': theme.colors.background,
          '--ai-foreground': theme.colors.foreground,
          '--ai-muted': theme.colors.muted,
          '--ai-font-heading': theme.fonts.heading,
          '--ai-font-body': theme.fonts.body,
          '--ai-spacing-base': theme.spacing.base,
          '--ai-spacing-container': theme.spacing.container,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </AIThemeContext.Provider>
  );
};

export const useAITheme = () => {
  const context = useContext(AIThemeContext);
  if (!context) {
    throw new Error('useAITheme must be used within an AIThemeProvider');
  }
  return context;
};