"use client";

import React from 'react';

interface WireframeData {
  projectType?: string;
  layout?: string;
  components?: string[];
}

interface WireframeDisplayProps {
  wireframe: WireframeData | null;
}

export function WireframeDisplay({ wireframe }: WireframeDisplayProps) {
  if (!wireframe) return null;

  return (
    <div className="space-y-4">
      <div className="text-sm text-white/80">
        <p className="mb-2"><strong>Project Type:</strong> {wireframe.projectType}</p>
        <p className="mb-4"><strong>Layout Description:</strong></p>
        <div className="bg-black/20 p-3 rounded text-white/90 text-xs whitespace-pre-wrap">
          {wireframe.layout}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white mb-2">Key Components:</h4>
        <div className="grid grid-cols-2 gap-2">
          {wireframe.components?.map((component: string, index: number) => (
            <div key={index} className="bg-white/10 p-2 rounded text-xs text-white/80">
              {component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}