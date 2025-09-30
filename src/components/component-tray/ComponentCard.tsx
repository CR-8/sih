'use client';

import React from 'react';
import { ComponentInfo } from './component-registry';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComponentCardProps {
  component: ComponentInfo;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const ComponentCard = ({ component, isSelected, onClick, className }: ComponentCardProps) => {
  const ComponentPreview = component.component;
  
  return (
    <Card
      className={cn(
        'flex-shrink-0 w-40 h-28 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] overflow-hidden border border-gray-200/60',
        isSelected && 'ring-2 ring-blue-400/60 shadow-md scale-[1.02] bg-blue-50/30',
        !isSelected && 'hover:border-gray-300/80',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0 h-full relative">
        {/* Component Preview Thumbnail */}
        <div className="w-full h-20 bg-gradient-to-br from-gray-50/80 to-gray-100/60 overflow-hidden relative">
          <div className="absolute inset-0 transform scale-[0.12] origin-top-left opacity-80">
            <div className="w-[833%] h-[833%] bg-white rounded">
              <ComponentPreview />
            </div>
          </div>
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-white/20 pointer-events-none" />
          
          {/* Preview label */}
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-white/80 backdrop-blur-sm rounded text-[9px] text-gray-600 font-medium">
            Preview
          </div>
        </div>
        
        {/* Component Info */}
        <div className="p-2 h-8 flex items-center justify-between bg-white/90 backdrop-blur-sm">
          <span className="text-xs font-medium text-gray-700 truncate flex-1">
            {component.name}
          </span>
          <Badge variant="secondary" className="text-[9px] ml-1 px-1.5 py-0 bg-gray-100/80 text-gray-600 border-0">
            {component.category}
          </Badge>
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white shadow-sm" />
        )}
      </CardContent>
    </Card>
  );
};

export { ComponentCard };