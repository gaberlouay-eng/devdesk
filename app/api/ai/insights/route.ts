import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export async function GET() {
  try {
    const items = await prisma.item.findMany();

    const stats = {
      total: items.length,
      tasks: items.filter((i) => i.type === "TASK").length,
      bugs: items.filter((i) => i.type === "BUG").length,
      todo: items.filter((i) => i.status === "TODO").length,
      inProgress: items.filter((i) => i.status === "IN_PROGRESS").length,
      done: items.filter((i) => i.status === "DONE").length,
      highPriority: items.filter((i) => i.priority === "HIGH").length,
      bugsInProgress: items.filter(
        (i) => i.type === "BUG" && i.status === "IN_PROGRESS"
      ).length,
      highPriorityTasks: items.filter(
        (i) => i.type === "TASK" && i.priority === "HIGH"
      ).length,
    };

    let suggestion = "";
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `Based on these task/bug statistics:
- Total items: ${stats.total}
- Tasks: ${stats.tasks}, Bugs: ${stats.bugs}
- Status: ${stats.todo} To Do, ${stats.inProgress} In Progress, ${stats.done} Done
- High Priority items: ${stats.highPriority}
- Bugs in progress: ${stats.bugsInProgress}
- High priority tasks: ${stats.highPriorityTasks}

Provide a brief, actionable suggestion (1-2 sentences) on what to focus on next.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful productivity assistant. Provide concise, actionable suggestions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        });

        suggestion = completion.choices[0]?.message?.content || "";
      } catch (error) {
        console.error("Error generating AI suggestion:", error);
      }
    }

    return NextResponse.json({ stats, suggestion });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

