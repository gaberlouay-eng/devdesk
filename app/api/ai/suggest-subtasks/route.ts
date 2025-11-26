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

    const { title, description } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Given the following task:
Title: ${title}
Description: ${description || "No description provided"}

Break down this task into 3-5 specific, actionable subtasks. Format the response as a bulleted list. Each subtask should be clear and actionable.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that breaks down tasks into actionable subtasks. Always format your response as a clear bulleted list.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const subtasks = completion.choices[0]?.message?.content || "Unable to generate subtasks.";

    return NextResponse.json({ subtasks });
  } catch (error) {
    console.error("Error generating subtasks:", error);
    return NextResponse.json(
      { error: "Failed to generate subtasks" },
      { status: 500 }
    );
  }
}

