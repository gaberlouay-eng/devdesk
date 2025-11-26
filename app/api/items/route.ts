import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ItemType, ItemStatus, ItemPriority } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as ItemType | null;
    const status = searchParams.get("status") as ItemStatus | null;
    const priority = searchParams.get("priority") as ItemPriority | null;
    const projectId = searchParams.get("projectId") || null;
    const search = searchParams.get("search") || "";

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (search) {
      where.title = {
        contains: search,
      };
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, status, priority, projectId, estimatedHours, actualHours } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Type and title are required" },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        type,
        title,
        description: description || null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        projectId: projectId || null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        actualHours: actualHours ? parseFloat(actualHours) : null,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}

