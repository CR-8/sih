'use client';

import React from 'react';
import { Hero as OriginalHero } from '@/components/trial/hero1';
import { AITheme } from '../AIThemeProvider';

interface StyledHeroProps {
  theme?: AITheme;
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
}

export const StyledHero = ({ theme, ...props }: StyledHeroProps) => {
  const defaultProps = {
    heading: "AI-Powered Design Platform",
    description: "Create stunning, personalized designs with our intelligent recommendation system that adapts to your style preferences.",
    buttons: {
      primary: {
        text: "Get Started",
        url: "#"
      },
      secondary: {
        text: "Learn More",
        url: "#"
      }
    }
  };

  return (
    <div className="ai-themed">
      <style jsx>{`
        .ai-themed {
          --ai-primary: ${theme?.colors.primary || '#3B82F6'};
          --ai-secondary: ${theme?.colors.secondary || '#F1F5F9'};
          --ai-accent: ${theme?.colors.accent || '#10B981'};
          --ai-background: ${theme?.colors.background || '#FFFFFF'};
          --ai-foreground: ${theme?.colors.foreground || '#1F2937'};
          --ai-muted: ${theme?.colors.muted || '#F8FAFC'};
          --ai-font-heading: ${theme?.fonts.heading || 'Inter, sans-serif'};
          --ai-font-body: ${theme?.fonts.body || 'Inter, sans-serif'};
        }
      `}</style>
      <OriginalHero {...{ ...defaultProps, ...props }} />
    </div>
  );
};