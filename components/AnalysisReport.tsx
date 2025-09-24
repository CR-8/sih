"use client";

import React from 'react';

interface ColorPalette {
  [key: string]: string;
}

interface Typography {
  [key: string]: string;
}

interface Spacing {
  unit?: string;
  scale?: number[];
}

interface DesignSpecs {
  colorPalette?: ColorPalette;
  typography?: Typography;
  spacing?: Spacing;
  recommendations?: string[];
}

interface AnalysisReportProps {
  specs: DesignSpecs | null;
}

export function AnalysisReport({ specs }: AnalysisReportProps) {
  if (!specs) return null;

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      {specs.colorPalette && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Color Palette</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(specs.colorPalette).map(([name, color]) => (
              <div key={name} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border border-white/20"
                  style={{ backgroundColor: color as string }}
                />
                <div>
                  <p className="text-sm font-medium text-white capitalize">{name}</p>
                  <p className="text-xs text-white/70 font-mono">{color as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Typography */}
      {specs.typography && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Typography</h3>
          <div className="space-y-3">
            {Object.entries(specs.typography).map(([type, font]) => (
              <div key={type} className="bg-white/10 p-3 rounded">
                <p className="text-xs text-white/60 capitalize mb-1">{type}</p>
                <p
                  className="text-sm font-medium text-white"
                  style={{ fontFamily: font as string }}
                >
                  {font as string}
                </p>
                <p
                  className="text-sm text-white/80 mt-1"
                  style={{ fontFamily: font as string }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacing */}
      {specs.spacing && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Spacing System</h3>
          <div className="bg-white/10 p-3 rounded">
            <p className="text-sm text-white/80">
              Base unit: {specs.spacing.unit || '0.25rem'}
            </p>
            {specs.spacing.scale && (
              <div className="mt-2">
                <p className="text-xs text-white/60 mb-2">Scale:</p>
                <div className="flex flex-wrap gap-1">
                  {specs.spacing.scale.map((value: number) => (
                    <span key={value} className="text-xs bg-white/20 px-2 py-1 rounded text-white/80">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {specs.recommendations && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {specs.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-sm text-white/80 flex items-start gap-2">
                <span className="text-white/60 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}