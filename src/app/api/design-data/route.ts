import { NextRequest, NextResponse } from 'next/server';

interface DesignData {
  projectDescription: string;
  colorPreference: string;
  theme: string;
  mood: string;
  style: string;
  targetAudience: string;
}

export async function POST(request: NextRequest) {
  try {
    const designData: DesignData = await request.json();
    
    console.log('Received design data:', designData);
    
    // Try to send to Flask backend
    try {
      const flaskResponse = await fetch('http://localhost:5000/generate-design', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(designData),
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (flaskResponse.ok) {
        const flaskData = await flaskResponse.json();
        console.log('Flask backend response:', flaskData);
        
        return NextResponse.json({
          success: true,
          data: flaskData,
          source: 'flask_backend'
        });
      } else {
        console.log('Flask backend error:', flaskResponse.status);
        throw new Error(`Flask backend returned ${flaskResponse.status}`);
      }
    } catch (flaskError) {
      console.log('Flask backend not available:', flaskError);
      
      // Generate fallback recommendations
      const fallbackRecommendations = generateFallbackRecommendations(designData);
      
      return NextResponse.json({
        success: true,
        data: fallbackRecommendations,
        source: 'fallback',
        message: 'Using fallback recommendations - Flask backend not available'
      });
    }

  } catch (error) {
    console.error('Error in design-data API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process design data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateFallbackRecommendations(designData: DesignData) {
  // Generate 5-6 color palettes based on user preferences
  const colorPalettes = generateColorPalettes(designData.colorPreference);
  
  // Generate font pairs based on theme and style
  const fontPairs = generateFontPairs(designData.theme, designData.style);
  
  // Combine palettes and fonts into recommendations
  const recommendations = [];
  
  for (let i = 0; i < Math.min(colorPalettes.length, fontPairs.length); i++) {
    recommendations.push({
      id: `rec-${i + 1}`,
      name: `${designData.theme} ${designData.mood} Design ${i + 1}`,
      colors: colorPalettes[i],
      fonts: fontPairs[i],
      description: generateDescription(designData, i),
      tags: generateTags(designData)
    });
  }
  
  return {
    recommendations,
    metadata: {
      totalGenerated: recommendations.length,
      basedOn: designData,
      generatedAt: new Date().toISOString()
    }
  };
}

function generateColorPalettes(colorPreference: string): string[][] {
  const colorMaps: Record<string, string[][]> = {
    'Blue (Professional & Trust)': [
      ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
      ['#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA'],
      ['#0C2B5F', '#1E40AF', '#2563EB', '#3B82F6', '#93C5FD'],
      ['#0F172A', '#1E293B', '#334155', '#64748B', '#94A3B8'],
      ['#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E'],
      ['#164E63', '#155E75', '#0891B2', '#0E7490', '#083344']
    ],
    'Purple (Creative & Luxury)': [
      ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#E9D5FF'],
      ['#6B21A8', '#7C2D92', '#8B5CF6', '#A78BFA', '#C4B5FD'],
      ['#581C87', '#6B21A8', '#7C2D92', '#8B5CF6', '#A78BFA'],
      ['#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6'],
      ['#9333EA', '#A855F7', '#B565A7', '#C084FC', '#D8B4FE'],
      ['#312E81', '#3730A3', '#4338CA', '#4F46E5', '#6366F1']
    ],
    'Green (Natural & Growth)': [
      ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
      ['#047857', '#059669', '#10B981', '#34D399', '#6EE7B7'],
      ['#064E3B', '#047857', '#059669', '#10B981', '#34D399'],
      ['#14532D', '#166534', '#15803D', '#16A34A', '#22C55E'],
      ['#365314', '#3F6212', '#4D7C0F', '#65A30D', '#84CC16'],
      ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF']
    ],
    'Orange (Energetic & Warm)': [
      ['#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA'],
      ['#C2410C', '#EA580C', '#F97316', '#FB923C', '#FDBA74'],
      ['#9A3412', '#C2410C', '#EA580C', '#F97316', '#FB923C'],
      ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
      ['#DC2625', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
      ['#7C2D12', '#92400E', '#B45309', '#D97706', '#F59E0B']
    ],
    'Red (Bold & Urgent)': [
      ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
      ['#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5'],
      ['#991B1B', '#B91C1C', '#DC2626', '#EF4444', '#F87171'],
      ['#7F1D1D', '#991B1B', '#B91C1C', '#DC2626', '#EF4444'],
      ['#BE185D', '#DB2777', '#EC4899', '#F472B6', '#F9A8D4'],
      ['#831843', '#9D174D', '#BE185D', '#DB2777', '#EC4899']
    ],
    'Neutral (Timeless & Elegant)': [
      ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF'],
      ['#111827', '#1F2937', '#374151', '#4B5563', '#6B7280'],
      ['#0F172A', '#1E293B', '#334155', '#475569', '#64748B'],
      ['#18181B', '#27272A', '#3F3F46', '#52525B', '#71717A'],
      ['#171717', '#262626', '#404040', '#525252', '#737373'],
      ['#0C0A09', '#1C1917', '#292524', '#44403C', '#57534E']
    ]
  };

  return colorMaps[colorPreference] || colorMaps['Neutral (Timeless & Elegant)'];
}

function generateFontPairs(theme: string, style: string): Array<{primary: string, secondary: string}> {
  const fontCombinations = [
    { primary: 'Inter', secondary: 'Inter' },
    { primary: 'Poppins', secondary: 'Open Sans' },
    { primary: 'Playfair Display', secondary: 'Source Sans Pro' },
    { primary: 'Montserrat', secondary: 'Roboto' },
    { primary: 'Lora', secondary: 'Nunito Sans' },
    { primary: 'Crimson Text', secondary: 'Work Sans' }
  ];

  // Customize based on theme
  if (theme.toLowerCase().includes('classic')) {
    return [
      { primary: 'Playfair Display', secondary: 'Source Sans Pro' },
      { primary: 'Crimson Text', secondary: 'Work Sans' },
      { primary: 'Cormorant Garamond', secondary: 'Nunito Sans' },
      { primary: 'Lora', secondary: 'Open Sans' },
      { primary: 'EB Garamond', secondary: 'Inter' },
      { primary: 'Merriweather', secondary: 'Roboto' }
    ];
  } else if (theme.toLowerCase().includes('modern')) {
    return [
      { primary: 'Inter', secondary: 'Inter' },
      { primary: 'Poppins', secondary: 'Open Sans' },
      { primary: 'Montserrat', secondary: 'Roboto' },
      { primary: 'Space Grotesk', secondary: 'Work Sans' },
      { primary: 'Plus Jakarta Sans', secondary: 'Inter' },
      { primary: 'Satoshi', secondary: 'System UI' }
    ];
  }

  return fontCombinations;
}

function generateDescription(designData: DesignData, index: number): string {
  const descriptors = [
    `A ${designData.mood.toLowerCase()} design perfect for ${designData.targetAudience.toLowerCase()}`,
    `${designData.theme} aesthetics with ${designData.style.toLowerCase()} layout approach`,
    `Optimized for ${designData.projectDescription.toLowerCase()} with professional appeal`,
    `Clean and intuitive design following ${designData.theme.toLowerCase()} principles`,
    `Engaging interface designed for ${designData.targetAudience.toLowerCase()} users`,
    `${designData.mood} atmosphere with ${designData.colorPreference.split(' ')[0].toLowerCase()} color scheme`
  ];
  
  return descriptors[index % descriptors.length];
}

function generateTags(designData: DesignData): string[] {
  return [
    designData.theme.toLowerCase(),
    designData.mood.toLowerCase(),
    designData.colorPreference.split(' ')[0].toLowerCase(),
    designData.style.toLowerCase().split(' ')[0],
    designData.targetAudience.toLowerCase().split(' ')[0]
  ];
}