import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designSpecs, requirements, format = 'markdown' } = body;

    // Generate a design document based on the specs
    const prompt = `
Create a comprehensive design document based on these specifications:

Requirements: ${JSON.stringify(requirements, null, 2)}
Design Specs: ${JSON.stringify(designSpecs, null, 2)}

Generate a ${format} document that includes:
1. Executive Summary
2. Design Requirements
3. Color Palette
4. Typography System
5. Layout Guidelines
6. Component Specifications
7. Implementation Notes

Make it professional and ready for development teams.
`;

    // Call Gemini to generate the document
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
      throw new Error('Failed to generate document');
    }

    const geminiData = await geminiResponse.json();

    return NextResponse.json({
      document: geminiData.response,
      format: format,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}