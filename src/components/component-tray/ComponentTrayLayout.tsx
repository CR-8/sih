'use client';

import { useState, useEffect } from 'react';
import { ComponentInfo } from './component-registry';
import { ComponentTray } from './ComponentTray';
import { PreviewArea } from './PreviewArea';
import { StyleVariablesInjector, AIStyleVariables } from './StyleVariablesInjector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  RefreshCw, 
  Settings, 
  Download,
  Monitor,
  Tablet,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComponentTrayLayoutProps {
  aiVariables?: AIStyleVariables;
  onVariablesChange?: (variables: AIStyleVariables) => void;
  className?: string;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

const ComponentTrayLayout = ({ 
  aiVariables, 
  onVariablesChange, 
  className 
}: ComponentTrayLayoutProps) => {
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(null);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [isTrayCollapsed, setIsTrayCollapsed] = useState(false);
  const [isGeneratingStyles, setIsGeneratingStyles] = useState(false);

  // Sample AI-generated variables (you would get these from your AI service)
  const [currentAIVariables, setCurrentAIVariables] = useState<AIStyleVariables>(
    aiVariables || {
      primaryColor: 'hsl(261 78% 57%)',
      secondaryColor: 'hsl(210 14% 96%)',
      accentColor: 'hsl(261 78% 57%)',
      backgroundColor: 'hsl(0 0% 100%)',
      foregroundColor: 'hsl(222 14% 11%)',
      mutedColor: 'hsl(210 14% 96%)',
      headingFont: '"Inter", system-ui, sans-serif',
      bodyFont: '"Inter", system-ui, sans-serif',
      borderRadius: '0.75rem',
      spacing: '1.5rem',
    }
  );

  const handleComponentSelect = (component: ComponentInfo) => {
    setSelectedComponent(component);
  };

  const handleGenerateNewStyles = async () => {
    setIsGeneratingStyles(true);
    
    // Simulate AI style generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newVariables: AIStyleVariables = {
      primaryColor: `hsl(${Math.floor(Math.random() * 360)} 70% 55%)`,
      secondaryColor: 'hsl(210 14% 96%)',
      accentColor: `hsl(${Math.floor(Math.random() * 360)} 60% 50%)`,
      backgroundColor: 'hsl(0 0% 100%)',
      foregroundColor: 'hsl(222 14% 11%)',
      mutedColor: 'hsl(210 14% 96%)',
      headingFont: [
        '"Inter", system-ui, sans-serif',
        '"Roboto", system-ui, sans-serif', 
        '"Poppins", system-ui, sans-serif',
        '"Open Sans", system-ui, sans-serif'
      ][Math.floor(Math.random() * 4)],
      bodyFont: '"Inter", system-ui, sans-serif',
      borderRadius: ['0.375rem', '0.5rem', '0.75rem', '1rem'][Math.floor(Math.random() * 4)],
      spacing: '1rem',
    };
    
    setCurrentAIVariables(newVariables);
    onVariablesChange?.(newVariables);
    setIsGeneratingStyles(false);
  };

  const getViewportStyles = () => {
    switch (viewportMode) {
      case 'tablet':
        return 'max-w-3xl';
      case 'mobile':
        return 'max-w-sm';
      default:
        return 'w-full';
    }
  };

  return (
    <StyleVariablesInjector variables={currentAIVariables}>
      <div className={cn('h-screen flex flex-col bg-background', className)}>
        {/* Top toolbar */}
        <div className="border-b bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Component Designer</h1>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTrayCollapsed(!isTrayCollapsed)}
                >
                  {isTrayCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedComponent ? selectedComponent.name : 'No component selected'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Viewport controls */}
              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant={viewportMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewportMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewportMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewportMode('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewportMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewportMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateNewStyles}
                disabled={isGeneratingStyles}
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', isGeneratingStyles && 'animate-spin')} />
                {isGeneratingStyles ? 'Generating...' : 'New AI Style'}
              </Button>
              
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Component Tray */}
          {!isTrayCollapsed && (
            <div className="w-80 flex-shrink-0">
              <ComponentTray
                selectedComponentId={selectedComponent?.id || null}
                onComponentSelect={handleComponentSelect}
              />
            </div>
          )}
          
          {/* Preview Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex justify-center overflow-auto bg-muted/20">
              <div className={cn(
                'transition-all duration-300 bg-background shadow-lg',
                getViewportStyles(),
                viewportMode !== 'desktop' && 'my-4 rounded-lg border'
              )}>
                <PreviewArea 
                  selectedComponent={selectedComponent}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom status bar */}
        <div className="border-t bg-muted/30 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>AI Designer v1.0</span>
              <span>•</span>
              <span>{selectedComponent ? `Rendering: ${selectedComponent.id}` : 'No component selected'}</span>
              <span>•</span>
              <span>Viewport: {viewportMode}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Variables: {Object.keys(currentAIVariables).length} applied</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyleVariablesInjector>
  );
};

export { ComponentTrayLayout };