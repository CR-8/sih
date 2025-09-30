import { NextRequest, NextResponse } from 'next/server';

interface RecommendationRequest {
  selections: Record<string, string>;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { selections, description } = body;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Try to call the Python AI model first
    try {
      const response = await fetch('http://localhost:5000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selections, description }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          recommendation: data.recommendation || data.reply,
          source: 'ai_model'
        });
      }
    } catch (error) {
      console.log('Python AI model not available, using fallback');
    }

    // Fallback recommendation generation based on selections
    const recommendation = generateFallbackRecommendation(selections, description);

    return NextResponse.json({
      success: true,
      recommendation,
      source: 'fallback'
    });

  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate recommendation' 
      },
      { status: 500 }
    );
  }
}

function generateFallbackRecommendation(selections: Record<string, string>, description?: string): string {
  const { mood, color_pref, style, audience, premium } = selections;

  let recommendation = `Based on your preferences, here's a tailored design recommendation:\n\n`;

  // Project context
  if (description) {
    recommendation += `**Project Overview:**\nFor your ${description.toLowerCase()}, `;
  }

  // Color scheme recommendation
  if (color_pref) {
    const colorMap: Record<string, string> = {
      'Blue': 'professional blue palette that conveys trust and reliability',
      'Purple': 'creative purple scheme that suggests innovation and luxury',
      'Green': 'natural green palette that represents growth and harmony',
      'Orange': 'energetic orange scheme that creates enthusiasm and warmth',
      'Red': 'bold red palette that demands attention and conveys urgency',
      'Neutral': 'timeless neutral colors that provide versatility and elegance'
    };
    
    recommendation += `I recommend using a ${colorMap[color_pref] || 'carefully chosen color scheme'}. `;
  }

  // Style and layout
  if (style) {
    const styleMap: Record<string, string> = {
      'Clean': 'clean, minimalist layout with plenty of white space',
      'Grid-based': 'structured grid system that organizes content systematically',
      'Traditional': 'classic layout approach with familiar navigation patterns',
      'Contemporary': 'modern design elements with current web standards',
      'Card-based': 'card-based interface that segments information clearly'
    };
    
    recommendation += `The layout should follow a ${styleMap[style] || 'well-structured approach'}. `;
  }

  // Mood and atmosphere
  if (mood) {
    const moodMap: Record<string, string> = {
      'Playful': 'incorporate rounded corners, vibrant accents, and interactive elements',
      'Minimalist': 'embrace simplicity with clean lines and essential elements only',
      'Bold': 'use strong typography, high contrast, and statement design elements',
      'Elegant': 'employ sophisticated typography and refined visual hierarchy',
      'Modern': 'integrate contemporary design trends and cutting-edge aesthetics'
    };
    
    recommendation += `To achieve a ${mood.toLowerCase()} mood, ${moodMap[mood] || 'consider appropriate design elements'}. `;
  }

  // Audience considerations
  if (audience) {
    const audienceMap: Record<string, string> = {
      'Tech professionals': 'Focus on functionality, clear information architecture, and performance indicators',
      'Creative/artists': 'Emphasize visual storytelling, portfolio showcases, and creative freedom',
      'Business': 'Prioritize credibility, clear value propositions, and professional appearance',
      'General public': 'Ensure accessibility, intuitive navigation, and broad appeal',
      'Young adults': 'Include social features, mobile-first design, and engaging interactions'
    };
    
    recommendation += `\n\n**Target Audience Considerations:**\n${audienceMap[audience] || 'Design with your specific audience needs in mind'}. `;
  }

  // Premium features
  if (premium === 'Yes') {
    recommendation += `\n\n**Premium Features:**\n- Advanced animations and micro-interactions\n- Custom illustrations and graphics\n- Performance optimization\n- Advanced analytics integration\n- Multi-device testing and optimization`;
  }

  // Typography recommendation
  recommendation += `\n\n**Typography:**\nUse clean, readable fonts that complement your ${mood?.toLowerCase() || 'chosen'} aesthetic. Consider font pairing for hierarchy and emphasis.`;

  // Final recommendations
  recommendation += `\n\n**Next Steps:**\n1. Create wireframes based on these recommendations\n2. Develop a comprehensive style guide\n3. Test the design with your target audience\n4. Iterate based on feedback and analytics`;

  return recommendation;
}