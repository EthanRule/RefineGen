import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { prompt, selectedAttributes, usedSections = [] } = requestBody;

    // Validate prompt exists and is a string
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate prompt length (max 200 characters)
    if (prompt.length > 200) {
      return NextResponse.json(
        { error: 'Prompt must be 200 characters or less' },
        { status: 400 }
      );
    }

    // Sanitize the prompt
    const sanitizedPrompt = prompt
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200);

    if (!sanitizedPrompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt contains only invalid characters' },
        { status: 400 }
      );
    }

    // Check if prompt is just repeated characters (e.g., "aaaaaaa" or "ddddddd")
    const uniqueChars = new Set(sanitizedPrompt.replace(/\s/g, '').toLowerCase());
    if (uniqueChars.size <= 2 && sanitizedPrompt.length > 10) {
      return NextResponse.json(
        { error: 'Please provide a more descriptive prompt' },
        { status: 400 }
      );
    }

    // Check if prompt has at least some meaningful content (has vowels and consonants)
    const hasVowels = /[aeiou]/i.test(sanitizedPrompt);
    const hasConsonants = /[bcdfghjklmnpqrstvwxyz]/i.test(sanitizedPrompt);
    if (!hasVowels || !hasConsonants) {
      return NextResponse.json(
        { error: 'Please provide a more descriptive prompt with actual words' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Generate a new dynamic section and options

    // Build context from selected attributes and used sections
    const attributesText =
      selectedAttributes && selectedAttributes.length > 0
        ? `The user has already selected these attributes: ${selectedAttributes.join(', ')}.`
        : '';

    const sectionsText =
      usedSections && usedSections.length > 0
        ? `The user has already seen these sections: ${usedSections.join(', ')}.`
        : '';

    const contextText = [attributesText, sectionsText].filter(Boolean).join(' ');

    // Generate 3 dynamic sections with 10 options each using GPT
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert image generation assistant. Given a user's prompt and any previously selected attributes, create 3 NEW attribute sections with 10 specific options each that would help refine their image.

Rules:
- Create 3 NEW section names that haven't been used yet (avoid repeating any sections the user has already seen)
- Generate exactly 10 options for each section
- Each option must be 1-3 words maximum (keep them short and concise)
- No special characters, just letters and spaces
- Make options specific and actionable for image generation
- Consider the user's prompt and any previously selected attributes
- IMPORTANT: Do NOT repeat any attributes that the user has already selected
- IMPORTANT: Do NOT repeat any section names that the user has already seen
- Make sure all options make sense for the image they want to create
- Keep all options SHORT (1-3 words max) for better UI display
- Return ONLY a JSON object with this exact structure:
{
  "sections": [
    {
      "name": "Section Name 1",
      "options": ["option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8", "option9", "option10"]
    },
    {
      "name": "Section Name 2", 
      "options": ["option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8", "option9", "option10"]
    },
    {
      "name": "Section Name 3",
      "options": ["option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8", "option9", "option10"]
    }
  ]
}

Examples of good SHORT options: "bright", "dark", "close-up", "wide shot", "soft", "sharp", "warm", "cool", "natural", "artificial", "minimalist", "detailed", "vibrant", "muted", "dramatic", "peaceful"

Examples of good section names: "Lighting", "Perspective", "Texture", "Style", "Focus", "Depth", "Contrast", "Movement", "Scale", "Detail Level", "Atmosphere", "Composition", "Color Temperature", "Sharpness", "Background", "Foreground", "Angle", "Distance", "Weather", "Time of Day"`,
        },
        {
          role: 'user',
          content: `${contextText} For the image prompt "${sanitizedPrompt}", create 3 new attribute sections with 10 specific options each that would help refine this image.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseText = response.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response generated');
    }

    // Parse the JSON response
    let sectionData;
    try {
      sectionData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse section JSON:', responseText);

      // Try to extract JSON from markdown code blocks or other text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          sectionData = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error('Invalid section format - could not extract valid JSON');
        }
      } else {
        throw new Error('Invalid section format - no JSON found in response');
      }
    }

    console.log('Parsed section data:', JSON.stringify(sectionData, null, 2));

    // Validate the structure
    if (!sectionData.sections || !Array.isArray(sectionData.sections)) {
      throw new Error('Invalid sections data structure');
    }

    if (sectionData.sections.length < 1) {
      throw new Error('Must have at least 1 section');
    }

    // Take up to 3 sections if more are provided
    const sectionsToProcess = sectionData.sections.slice(0, 3);

    // Validate and clean up each section
    const cleanedSections = sectionsToProcess.map((section: any, index: number) => {
      if (!section.name || !section.options || !Array.isArray(section.options)) {
        throw new Error(`Invalid structure for section ${index + 1}`);
      }

      if (section.options.length < 5) {
        throw new Error(`Section ${index + 1} must have at least 5 options`);
      }

      // Take up to 10 options if more are provided
      const optionsToProcess = section.options.slice(0, 10);

      // Clean up options (allow multi-word options, lowercase)
      const cleanedOptions = optionsToProcess
        .map((option: string) => option.trim().toLowerCase())
        .filter((option: string) => option.length > 0 && /^[a-zA-Z\s]+$/.test(option));

      if (cleanedOptions.length < 3) {
        throw new Error(`Section ${index + 1} must have at least 3 valid options`);
      }

      return {
        name: section.name,
        options: cleanedOptions,
      };
    });

    return NextResponse.json({
      sections: cleanedSections,
      prompt: sanitizedPrompt,
    });
  } catch (error) {
    console.error('Section generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate section options',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
