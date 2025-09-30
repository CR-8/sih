'use client';

import { ComponentInfo } from './component-registry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Code, 
  Palette, 
  Settings, 
  RefreshCw, 
  ExternalLink,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PreviewAreaProps {
  selectedComponent: ComponentInfo | null;
  className?: string;
}

const PreviewArea = ({ selectedComponent, className }: PreviewAreaProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!selectedComponent) {
    return (
      <div className={cn('flex flex-col h-full bg-background', className)}>
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div className="max-w-md">
            <Eye className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">Select a Component</h3>
            <p className="text-muted-foreground">
              Choose a component from the tray to see it rendered with your AI-generated styles.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Palette className="h-4 w-4" />
                Dynamic Styling
              </div>
              <div className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Real-time Preview
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Component = selectedComponent.component;

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold">{selectedComponent.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedComponent.description}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {selectedComponent.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
            <Button variant="ghost" size="sm">
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showInfo && (
          <>
            <Separator className="my-3" />
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Component ID:</span>
                  <code className="ml-2 text-xs bg-background px-1 py-0.5 rounded">
                    {selectedComponent.id}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <span className="ml-2 capitalize">{selectedComponent.category}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="font-medium">AI Styling:</span>
                <span className="ml-2 text-muted-foreground">
                  Applied via CSS variables (--primary-color, --heading-font, etc.)
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full">
          {/* AI Style Variables Injection */}
          <style>{`
            .preview-container {
              /* AI-generated variables will be injected here */
              --primary-color: hsl(var(--primary));
              --secondary-color: hsl(var(--secondary));
              --accent-color: hsl(var(--accent));
              --background-color: hsl(var(--background));
              --foreground-color: hsl(var(--foreground));
              --muted-color: hsl(var(--muted));
              --heading-font: var(--font-sans);
              --body-font: var(--font-sans);
              
              /* Apply the variables to the component */
              color: var(--foreground-color);
              background: var(--background-color);
              font-family: var(--body-font);
            }
            
            .preview-container h1,
            .preview-container h2,
            .preview-container h3,
            .preview-container h4,
            .preview-container h5,
            .preview-container h6 {
              font-family: var(--heading-font);
              color: var(--foreground-color);
            }
            
            .preview-container [class*="bg-primary"] {
              background-color: var(--primary-color) !important;
            }
            
            .preview-container [class*="text-primary"] {
              color: var(--primary-color) !important;
            }
            
            .preview-container [class*="border-primary"] {
              border-color: var(--primary-color) !important;
            }
          `}</style>
          
          <div className="preview-container h-full">
            <Component {...(selectedComponent.defaultProps || {})} />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Live Preview</span>
            <span>•</span>
            <span>AI Styled</span>
            <span>•</span>
            <span>Component: {selectedComponent.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PreviewArea };