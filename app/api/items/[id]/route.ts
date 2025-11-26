import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ItemStatus, ItemPriority } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, projectId, estimatedHours, actualHours } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    // Validate status is a valid ItemStatus enum value
    if (status !== undefined) {
      const validStatuses: ItemStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
      if (validStatuses.includes(status as ItemStatus)) {
        updateData.status = status;
      } else {
        return NextResponse.json(
          { error: `Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
    }
    // Validate priority is a valid ItemPriority enum value
    if (priority !== undefined) {
      const validPriorities: ItemPriority[] = ["LOW", "MEDIUM", "HIGH"];
      if (validPriorities.includes(priority as ItemPriority)) {
        updateData.priority = priority;
      } else {
        return NextResponse.json(
          { error: `Invalid priority: ${priority}. Must be one of: ${validPriorities.join(", ")}` },
          { status: 400 }
        );
      }
    }
    if (projectId !== undefined) updateData.projectId = projectId || null;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours ? parseFloat(estimatedHours) : null;
    if (actualHours !== undefined) updateData.actualHours = actualHours ? parseFloat(actualHours) : null;

    const item = await prisma.item.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

