'use client';

import { useEffect } from 'react';

export interface AIStyleVariables {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  mutedColor?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
  spacing?: string;
}

interface StyleVariablesInjectorProps {
  variables: AIStyleVariables;
  children: React.ReactNode;
}

const defaultVariables: AIStyleVariables = {
  primaryColor: 'hsl(220 90% 60%)',
  secondaryColor: 'hsl(220 14% 96%)',
  accentColor: 'hsl(220 14% 96%)',
  backgroundColor: 'hsl(0 0% 100%)',
  foregroundColor: 'hsl(220 14% 14%)',
  mutedColor: 'hsl(220 14% 96%)',
  headingFont: 'system-ui, -apple-system, sans-serif',
  bodyFont: 'system-ui, -apple-system, sans-serif',
  borderRadius: '0.5rem',
  spacing: '1rem',
};

const StyleVariablesInjector = ({ variables, children }: StyleVariablesInjectorProps) => {
  const mergedVariables = { ...defaultVariables, ...variables };

  useEffect(() => {
    // Inject CSS variables into the document root
    const root = document.documentElement;
    
    // Set AI-generated variables
    if (mergedVariables.primaryColor) {
      root.style.setProperty('--ai-primary-color', mergedVariables.primaryColor);
    }
    if (mergedVariables.secondaryColor) {
      root.style.setProperty('--ai-secondary-color', mergedVariables.secondaryColor);
    }
    if (mergedVariables.accentColor) {
      root.style.setProperty('--ai-accent-color', mergedVariables.accentColor);
    }
    if (mergedVariables.backgroundColor) {
      root.style.setProperty('--ai-background-color', mergedVariables.backgroundColor);
    }
    if (mergedVariables.foregroundColor) {
      root.style.setProperty('--ai-foreground-color', mergedVariables.foregroundColor);
    }
    if (mergedVariables.mutedColor) {
      root.style.setProperty('--ai-muted-color', mergedVariables.mutedColor);
    }
    if (mergedVariables.headingFont) {
      root.style.setProperty('--ai-heading-font', mergedVariables.headingFont);
    }
    if (mergedVariables.bodyFont) {
      root.style.setProperty('--ai-body-font', mergedVariables.bodyFont);
    }
    if (mergedVariables.borderRadius) {
      root.style.setProperty('--ai-border-radius', mergedVariables.borderRadius);
    }
    if (mergedVariables.spacing) {
      root.style.setProperty('--ai-spacing', mergedVariables.spacing);
    }

    // Cleanup function to remove variables when component unmounts
    return () => {
      root.style.removeProperty('--ai-primary-color');
      root.style.removeProperty('--ai-secondary-color');
      root.style.removeProperty('--ai-accent-color');
      root.style.removeProperty('--ai-background-color');
      root.style.removeProperty('--ai-foreground-color');
      root.style.removeProperty('--ai-muted-color');
      root.style.removeProperty('--ai-heading-font');
      root.style.removeProperty('--ai-body-font');
      root.style.removeProperty('--ai-border-radius');
      root.style.removeProperty('--ai-spacing');
    };
  }, [mergedVariables]);

  return (
    <>
      {/* Inject global styles that use the AI variables */}
      <style jsx global>{`
        .ai-styled {
          --primary: var(--ai-primary-color, ${defaultVariables.primaryColor});
          --secondary: var(--ai-secondary-color, ${defaultVariables.secondaryColor});
          --accent: var(--ai-accent-color, ${defaultVariables.accentColor});
          --background: var(--ai-background-color, ${defaultVariables.backgroundColor});
          --foreground: var(--ai-foreground-color, ${defaultVariables.foregroundColor});
          --muted: var(--ai-muted-color, ${defaultVariables.mutedColor});
          --heading-font: var(--ai-heading-font, ${defaultVariables.headingFont});
          --body-font: var(--ai-body-font, ${defaultVariables.bodyFont});
          --radius: var(--ai-border-radius, ${defaultVariables.borderRadius});
          --spacing: var(--ai-spacing, ${defaultVariables.spacing});
        }
        
        .ai-styled * {
          font-family: var(--body-font);
        }
        
        .ai-styled h1,
        .ai-styled h2,
        .ai-styled h3,
        .ai-styled h4,
        .ai-styled h5,
        .ai-styled h6 {
          font-family: var(--heading-font);
        }
        
        .ai-styled .bg-primary {
          background-color: var(--primary) !important;
        }
        
        .ai-styled .text-primary {
          color: var(--primary) !important;
        }
        
        .ai-styled .border-primary {
          border-color: var(--primary) !important;
        }
        
        .ai-styled .bg-secondary {
          background-color: var(--secondary) !important;
        }
        
        .ai-styled .text-secondary {
          color: var(--secondary) !important;
        }
        
        .ai-styled .border-secondary {
          border-color: var(--secondary) !important;
        }
        
        .ai-styled .bg-accent {
          background-color: var(--accent) !important;
        }
        
        .ai-styled .text-accent {
          color: var(--accent) !important;
        }
        
        .ai-styled .border-accent {
          border-color: var(--accent) !important;
        }
      `}</style>
      {children}
    </>
  );
};

export { StyleVariablesInjector };