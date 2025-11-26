import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(items, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="devdesk-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting items:", error);
    return NextResponse.json(
      { error: "Failed to export items" },
      { status: 500 }
    );
  }
}

