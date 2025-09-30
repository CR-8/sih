'use client';

import React from 'react';
import { ComponentInfo, componentRegistry } from './component-registry';
import { ComponentCard } from './ComponentCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ComponentTrayProps {
  selectedComponentId: string | null;
  onComponentSelect: (component: ComponentInfo) => void;
}

const ComponentTray = ({ selectedComponentId, onComponentSelect }: ComponentTrayProps) => {
  const router = useRouter();

  const handleViewComponent = () => {
    if (selectedComponentId) {
      router.push(`/component-preview/${selectedComponentId}`);
    }
  };

  const selectedComponentData = componentRegistry.find(c => c.id === selectedComponentId);

  return (
    <div className="w-full bg-gradient-to-br from-gray-50/50 to-white">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Component Library</h2>
          <p className="text-gray-500 text-sm mt-0.5">Choose a component to preview with AI styling</p>
        </div>
        <Button 
          onClick={handleViewComponent}
          disabled={!selectedComponentId}
          size="sm"
          className="flex items-center gap-1.5 text-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Refined Horizontal Rail */}
      <div className="px-4 pb-4">
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            <div className="flex gap-3 min-w-max pl-1">
              {componentRegistry.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  isSelected={selectedComponentId === component.id}
                  onClick={() => onComponentSelect(component)}
                />
              ))}
            </div>
          </div>
          {/* Subtle gradient fade on scroll edges */}
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50/80 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Compact Selection Info */}
      {selectedComponentId && selectedComponentData && (
        <div className="px-4 pb-4 border-t border-gray-200/60 bg-white/40">
          <div className="pt-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 text-sm truncate">{selectedComponentData.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{selectedComponentData.description}</p>
              </div>
              <Button 
                onClick={handleViewComponent}
                size="sm"
                variant="outline"
                className="ml-3 flex items-center gap-1.5 text-xs"
              >
                <Eye className="w-3 h-3" />
                View
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ComponentTray };