'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { componentRegistry } from '@/components/component-tray/component-registry';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, Type, Download, RefreshCw, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock AI-generated theme
const mockAITheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#F1F5F9', 
    accent: '#10B981',
    background: '#FFFFFF',
    foreground: '#1F2937',
    muted: '#F8FAFC'
  },
  fonts: {
    heading: '"Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif'
  }
};

export default function ComponentPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const componentId = params.componentId as string;

  const component = componentRegistry.find(c => c.id === componentId);

  if (!component) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Component Not Found</h1>
          <p className="text-gray-600 mb-6">The component "{componentId}" could not be found in our library.</p>
          <Button onClick={() => router.back()} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back to Library
          </Button>
        </div>
      </div>
    );
  }

  const ComponentToRender = component.component;

  // Enhanced props with AI styling
  const enhancedProps = {
    ...component.defaultProps,
    // Override specific props based on AI recommendations
    ...(component.id === 'hero1' && {
      heading: "AI-Powered Design Platform",
      description: "Transform your vision into stunning reality with our intelligent design system."
    })
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"
      style={{
        '--ai-primary': mockAITheme.colors.primary,
        '--ai-secondary': mockAITheme.colors.secondary,
        '--ai-accent': mockAITheme.colors.accent,
        '--ai-font-heading': mockAITheme.fonts.heading,
        '--ai-font-body': mockAITheme.fonts.body,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-20">
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="hidden sm:block h-4 w-px bg-gray-300" />
              <div>
                <h1 className="text-sm font-medium text-gray-900">{component.name}</h1>
                <p className="text-xs text-gray-500 hidden sm:block">{component.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Styled
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {component.category}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-fit mx-auto px-4 sm:px-6 py-6">
        {/* AI Theme Info */}
        <div className="mb-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-medium text-gray-600">Colors:</span>
              </div>
              <div className="flex gap-1.5">
                {Object.entries(mockAITheme.colors).slice(0, 3).map(([name, color]) => (
                  <div 
                    key={name} 
                    className="w-3 h-3 rounded-full border border-white/50 shadow-sm" 
                    style={{ backgroundColor: color }}
                    title={`${name}: ${color}`}
                  />
                ))}
                <span className="text-xs text-gray-400">+{Object.keys(mockAITheme.colors).length - 3}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs text-gray-600">Inter</span>
            </div>
          </div>
        </div>

        {/* Component Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden component-preview-enter">
          <div className="ai-theme-font-body p-6" style={{ fontFamily: mockAITheme.fonts.body }}>
            <ComponentToRender {...enhancedProps} />
          </div>
        </div>
      </div>
    </div>
  );
}