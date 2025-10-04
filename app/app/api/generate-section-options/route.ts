import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      selectedAttributes,
      usedSections = [],
    } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Generate a new dynamic section and options

    // Build context from selected attributes and used sections
    const attributesText =
      selectedAttributes && selectedAttributes.length > 0
        ? `The user has already selected these attributes: ${selectedAttributes.join(
            ", "
          )}.`
        : "";

    const sectionsText =
      usedSections && usedSections.length > 0
        ? `The user has already seen these sections: ${usedSections.join(
            ", "
          )}.`
        : "";

    const contextText = [attributesText, sectionsText]
      .filter(Boolean)
      .join(" ");

    // Generate 3 dynamic sections with 10 options each using GPT
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert image generation assistant. Given a user's prompt and any previously selected attributes, create 3 NEW attribute sections with 10 specific options each that would help refine their image.

Rules:
- Create 3 NEW section names that haven't been used yet (avoid repeating any sections the user has already seen)
- Generate exactly 10 options for each section
- Each option can be one or more words (no special characters, just letters and spaces)
- Make options specific and actionable for image generation
- Consider the user's prompt and any previously selected attributes
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

- IMPORTANT: Do NOT repeat any section names that the user has already seen
- Make sure all options make sense for the image they want to create

Examples of good section names: "Lighting", "Perspective", "Texture", "Style", "Focus", "Depth", "Contrast", "Movement", "Scale", "Detail Level", "Atmosphere", "Composition", "Color Temperature", "Sharpness", "Background", "Foreground", "Angle", "Distance", "Weather", "Time of Day"`,
        },
        {
          role: "user",
          content: `${contextText} For the image prompt "${prompt}", create 3 new attribute sections with 10 specific options each that would help refine this image.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseText = response.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error("No response generated");
    }

    // Parse the JSON response
    let sectionData;
    try {
      sectionData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse section JSON:", responseText);
      throw new Error("Invalid section format");
    }

    console.log("Parsed section data:", JSON.stringify(sectionData, null, 2));

    // Validate the structure
    if (!sectionData.sections || !Array.isArray(sectionData.sections)) {
      throw new Error("Invalid sections data structure");
    }

    if (sectionData.sections.length < 1) {
      throw new Error("Must have at least 1 section");
    }

    // Take up to 3 sections if more are provided
    const sectionsToProcess = sectionData.sections.slice(0, 3);

    // Validate and clean up each section
    const cleanedSections = sectionsToProcess.map(
      (section: any, index: number) => {
        if (
          !section.name ||
          !section.options ||
          !Array.isArray(section.options)
        ) {
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
          .filter(
            (option: string) =>
              option.length > 0 && /^[a-zA-Z\s]+$/.test(option)
          );

        if (cleanedOptions.length < 3) {
          throw new Error(
            `Section ${index + 1} must have at least 3 valid options`
          );
        }

        return {
          name: section.name,
          options: cleanedOptions,
        };
      }
    );

    return NextResponse.json({
      sections: cleanedSections,
      prompt,
    });
  } catch (error) {
    console.error("Section generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate section options",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
