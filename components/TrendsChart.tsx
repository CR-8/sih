"use client";

import React from 'react';

interface TrendItem {
  name: string;
  description: string;
  popularity: number;
  category: string;
}

interface ColorTrend {
  name: string;
  hex: string;
  trend: string;
}

interface TypographyTrend {
  name: string;
  style: string;
}

interface TrendsData {
  current?: TrendItem[];
  colors?: ColorTrend[];
  typography?: TypographyTrend[];
}

interface TrendsChartProps {
  trends: TrendsData;
}

export function TrendsChart({ trends }: TrendsChartProps) {
  if (!trends) return null;

  return (
    <div className="space-y-6">
      {/* Current Trends */}
      {trends.current && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Current Design Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trends.current.map((trend: TrendItem, index: number) => (
              <div key={index} className="bg-white/10 p-3 rounded">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white">{trend.name}</h4>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/80">
                    {trend.popularity}%
                  </span>
                </div>
                <p className="text-sm text-white/70 mb-2">{trend.description}</p>
                <span className="text-xs text-white/60">{trend.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Trends */}
      {trends.colors && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Trending Colors</h3>
          <div className="flex flex-wrap gap-3">
            {trends.colors.map((color: ColorTrend, index: number) => (
              <div key={index} className="text-center">
                <div
                  className="w-12 h-12 rounded-full border-2 border-white/20 mb-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-xs text-white font-medium">{color.name}</p>
                <p className="text-xs text-white/60">{color.trend}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Typography Trends */}
      {trends.typography && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Typography Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trends.typography.map((font: TypographyTrend, index: number) => (
              <div key={index} className="bg-white/10 p-3 rounded text-center">
                <div
                  className="text-lg font-bold text-white mb-2"
                  style={{ fontFamily: font.name }}
                >
                  {font.name}
                </div>
                <p className="text-xs text-white/70">{font.style}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}