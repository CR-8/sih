import { NextRequest, NextResponse } from 'next/server';

interface DesignRequirements {
  projectType?: string;
  targetAudience?: string;
  industry?: string;
  brandPersonality?: string[];
  preferredColors?: string[];
  colorMood?: string;
  typography?: {
    style?: string;
  };
  layoutPreferences?: {
    style?: string;
  };
  deviceTargets?: string[];
  accessibility?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { requirements } = await request.json();

    // Call Python AI model for design analysis and generation
    const pythonApiUrl = process.env.PYTHON_AI_MODEL_URL || 'http://localhost:8000';
    
    const response = await fetch(`${pythonApiUrl}/generate-design-specs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PYTHON_AI_MODEL_API_KEY || ''}`
      },
      body: JSON.stringify({
        project_type: requirements.projectType,
        target_audience: requirements.targetAudience,
        industry: requirements.industry,
        brand_personality: requirements.brandPersonality,
        preferred_colors: requirements.preferredColors,
        color_mood: requirements.colorMood,
        typography_style: requirements.typography?.style,
        layout_preferences: requirements.layoutPreferences?.style,
        device_targets: requirements.deviceTargets,
        accessibility_required: requirements.accessibility || false
      })
    });

    if (!response.ok) {
      console.error('Python API error:', response.status, await response.text());
      // Return fallback design specs
      return NextResponse.json(generateFallbackDesignSpecs(requirements));
    }

    const designSpecs = await response.json();
    return NextResponse.json(designSpecs);

  } catch (error) {
    console.error('Error generating design specs:', error);
    // Return fallback design specs
    return NextResponse.json(generateFallbackDesignSpecs({}));
  }
}

function generateFallbackDesignSpecs(requirements: DesignRequirements) {
  // Generate a basic design system based on requirements
  const brandPersonality = requirements.brandPersonality || [];
  const preferredColors = requirements.preferredColors || [];
  
  // Base color palette
  const colorPalette = {
    primary: "#2563eb",
    secondary: "#7c3aed", 
    accent: "#f59e0b",
    neutral: "#6b7280",
    background: "#ffffff",
    text: "#1f2937"
  };

  // Adjust colors based on brand personality and preferences
  if (brandPersonality.includes('playful') || brandPersonality.includes('creative')) {
    colorPalette.primary = "#ec4899";
    colorPalette.secondary = "#8b5cf6";
    colorPalette.accent = "#06d6a0";
  } else if (brandPersonality.includes('professional') || brandPersonality.includes('corporate')) {
    colorPalette.primary = "#1e40af";
    colorPalette.secondary = "#374151";
    colorPalette.accent = "#059669";
  } else if (brandPersonality.includes('modern') || brandPersonality.includes('tech')) {
    colorPalette.primary = "#0f172a";
    colorPalette.secondary = "#334155";
    colorPalette.accent = "#3b82f6";
  }

  // Adjust based on preferred colors
  if (preferredColors.length > 0) {
    const firstColor = preferredColors[0].toLowerCase();
    if (firstColor.includes('blue')) {
      colorPalette.primary = "#2563eb";
    } else if (firstColor.includes('green')) {
      colorPalette.primary = "#059669";
    } else if (firstColor.includes('purple')) {
      colorPalette.primary = "#7c3aed";
    } else if (firstColor.includes('red')) {
      colorPalette.primary = "#dc2626";
    } else if (firstColor.includes('orange')) {
      colorPalette.primary = "#ea580c";
    }
  }

  // Typography based on preferences
  const typography = {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    mono: "JetBrains Mono, monospace"
  };

  if (brandPersonality.includes('elegant') || brandPersonality.includes('luxury')) {
    typography.heading = "Playfair Display, serif";
    typography.body = "Source Sans Pro, sans-serif";
  } else if (brandPersonality.includes('friendly') || brandPersonality.includes('casual')) {
    typography.heading = "Poppins, sans-serif";
    typography.body = "Open Sans, sans-serif";
  } else if (brandPersonality.includes('tech') || brandPersonality.includes('modern')) {
    typography.heading = "Space Grotesk, sans-serif";
    typography.body = "Inter, sans-serif";
  }

  return {
    colorPalette,
    typography,
    spacing: {
      unit: "0.25rem",
      scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
    },
    recommendations: [
      "Use consistent spacing throughout the design",
      "Maintain proper color contrast for accessibility",
      "Keep typography hierarchy clear and consistent",
      `Primary color (${colorPalette.primary}) works well for call-to-action buttons`,
      `${typography.heading} creates ${brandPersonality.includes('elegant') ? 'an elegant' : brandPersonality.includes('friendly') ? 'a friendly' : 'a modern'} feel for headings`
    ],
    layouts: {
      recommended: requirements.layoutPreferences?.style || "clean and minimal",
      gridSystem: "12-column responsive grid",
      spacing: "8px base unit with 1.5x scale"
    },
    accessibility: {
      contrastRatio: "WCAG AA compliant",
      fontSize: "16px minimum body text",
      focusIndicators: "2px solid accent color"
    }
  };
}