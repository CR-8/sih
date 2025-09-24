import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, return mock trends data
    // In a real implementation, this could fetch from design trend APIs or databases

    const trends = {
      current: [
        {
          name: 'Neumorphism',
          description: 'Soft, inset button styles with subtle shadows',
          popularity: 85,
          category: 'UI Style'
        },
        {
          name: 'Glassmorphism',
          description: 'Translucent elements with blur effects',
          popularity: 78,
          category: 'Visual Effects'
        },
        {
          name: 'Dark Mode',
          description: 'Dark color schemes with proper contrast',
          popularity: 92,
          category: 'Color Schemes'
        },
        {
          name: 'Micro-interactions',
          description: 'Subtle animations for user feedback',
          popularity: 88,
          category: 'Animation'
        }
      ],
      colors: [
        { name: 'Sage Green', hex: '#87A96B', trend: 'Nature-inspired' },
        { name: 'Warm Gray', hex: '#D3D3D3', trend: 'Neutral palettes' },
        { name: 'Coral Pink', hex: '#FF7F50', trend: 'Warm accents' },
        { name: 'Deep Teal', hex: '#008080', trend: 'Ocean-inspired' }
      ],
      typography: [
        { name: 'Inter', style: 'Clean, modern sans-serif' },
        { name: 'Space Grotesk', style: 'Geometric, tech-focused' },
        { name: 'Cal Sans', style: 'Rounded, friendly' }
      ]
    };

    return NextResponse.json(trends);

  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}