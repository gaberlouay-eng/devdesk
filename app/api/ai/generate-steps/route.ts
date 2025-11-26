import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          message: "Please add OPENAI_API_KEY to your .env file to use AI features.",
        },
        { status: 400 }
      );
    }

    const { description, title } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Given the following bug report:
Title: ${title}
Description: ${description || "No description provided"}

Generate clear, step-by-step reproduction steps for this bug. Format the response as a numbered list. Be concise and specific.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates bug reproduction steps. Always format your response as a clear numbered list.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const steps = completion.choices[0]?.message?.content || "Unable to generate steps.";

    return NextResponse.json({ steps });
  } catch (error) {
    console.error("Error generating steps:", error);
    return NextResponse.json(
      { error: "Failed to generate reproduction steps" },
      { status: 500 }
    );
  }
}

