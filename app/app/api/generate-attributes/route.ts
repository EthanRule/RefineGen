import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Generate attribute suggestions using GPT
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert image generation assistant. Given a user's prompt, suggest 5 single-word attributes that would help refine and improve the image generation. 

Rules:
- Return exactly 5 attributes
- Each attribute should be a single word (no spaces, hyphens, or special characters)
- Focus on visual style, mood, composition, lighting, or artistic elements
- Make attributes specific and actionable for image generation
- Return only the words, separated by commas, no other text

Examples:
Prompt: "a cat" → "cute, fluffy, playful, colorful, detailed"
Prompt: "mountain landscape" → "dramatic, serene, misty, golden, panoramic"
Prompt: "cyberpunk city" → "neon, futuristic, dark, vibrant, urban"`,
        },
        {
          role: 'user',
          content: `Generate 5 single-word attributes for this image prompt: "${prompt}"`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const attributesText = response.choices[0]?.message?.content?.trim();

    if (!attributesText) {
      throw new Error('No attributes generated');
    }

    // Parse the attributes (split by comma and clean up)
    const attributes = attributesText
      .split(',')
      .map(attr => attr.trim().toLowerCase())
      .filter(attr => attr.length > 0 && /^[a-zA-Z]+$/.test(attr))
      .slice(0, 5); // Ensure we only get 5 attributes

    if (attributes.length === 0) {
      throw new Error('No valid attributes generated');
    }

    return NextResponse.json({
      attributes,
      prompt,
    });
  } catch (error) {
    console.error('Attribute generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate attributes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
