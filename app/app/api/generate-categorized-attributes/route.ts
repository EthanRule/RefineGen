import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, selectedAttributes } = await request.json();

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

    // Build context from selected attributes
    const contextText =
      selectedAttributes && selectedAttributes.length > 0
        ? `The user has already selected these attributes: ${selectedAttributes.join(
            ", "
          )}.`
        : "";

    // Generate categorized attribute suggestions using GPT
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert image generation assistant. Given a user's prompt and any previously selected attributes, suggest categorized attributes that would help refine and improve the image generation.

Rules:
- Return exactly 3 categories: "Art Style", "Mood & Atmosphere", "Technical Details"
- Each category should have 4-6 single-word attributes
- Each attribute should be a single word (no spaces, hyphens, or special characters)
- Make attributes specific and actionable for image generation
- Consider the user's prompt and any previously selected attributes
- Return ONLY a JSON object with this exact structure:
{
  "Art Style": ["word1", "word2", "word3", "word4"],
  "Mood & Atmosphere": ["word1", "word2", "word3", "word4"],
  "Technical Details": ["word1", "word2", "word3", "word4"]
}

Examples:
Prompt: "a cat" → 
{
  "Art Style": ["realistic", "cartoon", "anime", "watercolor"],
  "Mood & Atmosphere": ["cute", "playful", "serene", "mysterious"],
  "Technical Details": ["detailed", "colorful", "soft", "sharp"]
}`,
        },
        {
          role: "user",
          content: `${contextText} Generate categorized attributes for this image prompt: "${prompt}"`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const attributesText = response.choices[0]?.message?.content?.trim();

    if (!attributesText) {
      throw new Error("No attributes generated");
    }

    // Parse the JSON response
    let categorizedAttributes;
    try {
      categorizedAttributes = JSON.parse(attributesText);
    } catch (parseError) {
      console.error("Failed to parse attributes JSON:", attributesText);
      throw new Error("Invalid attributes format");
    }

    // Validate the structure
    const requiredCategories = [
      "Art Style",
      "Mood & Atmosphere",
      "Technical Details",
    ];
    const isValid = requiredCategories.every(
      (category) =>
        categorizedAttributes[category] &&
        Array.isArray(categorizedAttributes[category]) &&
        categorizedAttributes[category].length >= 4
    );

    if (!isValid) {
      throw new Error("Invalid categorized attributes structure");
    }

    // Clean up attributes (ensure single words, lowercase)
    const cleanedAttributes = {};
    for (const [category, attributes] of Object.entries(
      categorizedAttributes
    )) {
      cleanedAttributes[category] = attributes
        .map((attr) => attr.trim().toLowerCase())
        .filter((attr) => attr.length > 0 && /^[a-zA-Z]+$/.test(attr))
        .slice(0, 6); // Max 6 per category
    }

    return NextResponse.json({
      categorizedAttributes: cleanedAttributes,
      prompt,
    });
  } catch (error) {
    console.error("Categorized attribute generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate categorized attributes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
