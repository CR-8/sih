'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ComponentTrayLayout } from '@/components/component-tray/ComponentTrayLayout';
import { AIStyleVariables } from '@/components/component-tray/StyleVariablesInjector';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface DesignData {
  projectDescription: string;
  colorPreference: string;
  theme: string;
  mood: string;
  style: string;
  targetAudience: string;
}

interface SelectedRecommendation {
  id: string;
  name: string;
  colors: string[];
  fonts: {primary: string, secondary: string};
  description: string;
  tags: string[];
}

interface CombinedData {
  designData: DesignData;
  selectedRecommendation: SelectedRecommendation;
}

function ComponentDesigner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [combinedData, setCombinedData] = useState<CombinedData | null>(null);
  const [aiVariables, setAiVariables] = useState<AIStyleVariables | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get combined data from URL parameters
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam)) as CombinedData;
        setCombinedData(data);
        
        // Convert selected recommendation to AI style variables
        const styleVars = convertToAIVariables(data.selectedRecommendation);
        setAiVariables(styleVars);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing component data:', error);
        setError('Failed to load design configuration');
        setIsLoading(false);
      }
    } else {
      setError('No design configuration found');
      setIsLoading(false);
    }
  }, [searchParams]);

  const convertToAIVariables = (recommendation: SelectedRecommendation): AIStyleVariables => {
    // Convert hex colors to HSL for better CSS variable usage
    const primaryColorHex = recommendation.colors[0];
    const secondaryColorHex = recommendation.colors[1] || recommendation.colors[0];
    const accentColorHex = recommendation.colors[2] || recommendation.colors[0];
    
    return {
      primaryColor: hexToHsl(primaryColorHex),
      secondaryColor: hexToHsl(secondaryColorHex),
      accentColor: hexToHsl(accentColorHex),
      backgroundColor: 'hsl(0 0% 100%)',
      foregroundColor: 'hsl(222 14% 11%)',
      mutedColor: 'hsl(210 14% 96%)',
      headingFont: `"${recommendation.fonts.primary}", system-ui, sans-serif`,
      bodyFont: `"${recommendation.fonts.secondary}", system-ui, sans-serif`,
      borderRadius: '0.75rem',
      spacing: '1rem',
    };
  };

  // Helper function to convert hex to HSL
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
  };

  const handleVariablesChange = (variables: AIStyleVariables) => {
    setAiVariables(variables);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center bg-neutral-900 min-h-screen'>
        <Card className="w-96 bg-neutral-800 border-neutral-700">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading Component Designer</h3>
            <p className="text-neutral-400">Setting up your personalized design environment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !combinedData || !aiVariables) {
    return (
      <div className='flex items-center justify-center bg-neutral-900 min-h-screen'>
        <Card className="w-96 bg-neutral-800 border-red-500/50">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
            <p className="text-neutral-400 mb-4">{error || 'Failed to load design configuration'}</p>
            <Button onClick={() => router.push('/recommend')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ComponentTrayLayout
        aiVariables={aiVariables}
        onVariablesChange={handleVariablesChange}
      />
    </div>
  );
}

export default ComponentDesigner;