import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requirements, projectType } = body;

    // For now, generate a simple wireframe description using Gemini
    const prompt = `
Generate a wireframe layout for a ${projectType || 'web application'} based on these requirements:

${JSON.stringify(requirements, null, 2)}

Please provide:
1. A high-level page structure/layout
2. Key components and their positioning
3. Navigation elements
4. Content areas
5. Interactive elements

Format as a structured description that can be used to create a visual wireframe.
`;

    // Call Gemini API
    const geminiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'gemini',
        prompt: prompt
      })
    });

    if (!geminiResponse.ok) {
      throw new Error('Failed to generate wireframe');
    }

    const geminiData = await geminiResponse.json();

    // Return wireframe data
    return NextResponse.json({
      wireframe: {
        layout: geminiData.response,
        projectType: projectType,
        components: [
          'Header/Navigation',
          'Main Content Area',
          'Sidebar (if applicable)',
          'Footer'
        ],
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating wireframe:', error);
    return NextResponse.json(
      { error: 'Failed to generate wireframe' },
      { status: 500 }
    );
  }
}