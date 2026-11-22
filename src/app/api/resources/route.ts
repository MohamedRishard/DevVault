import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { resourceSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const pinnedOnly = searchParams.get("pinned") === "true";

    // Strict user scoping to prevent IDOR vulnerabilities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      userId: session.userId,
    };

    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (pinnedOnly) {
      where.isPinned = true;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { url: { contains: query, mode: "insensitive" } },
        { mainFunctions: { has: query } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
    });

    // Also fetch all unique categories for this user to populate filter pills
    const allUserCategories = await prisma.resource.findMany({
      where: { userId: session.userId },
      select: { category: true },
      distinct: ["category"],
    });

    const categories = Array.from(new Set(allUserCategories.map((c) => c.category))).filter(Boolean);

    return NextResponse.json({
      resources,
      categories,
    });
  } catch (error: unknown) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = resourceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid resource data" },
        { status: 400 }
      );
    }

    const { title, url, category, description, mainFunctions, isPinned } = result.data;

    // Strict scoping with userId from verified session
    const resource = await prisma.resource.create({
      data: {
        userId: session.userId,
        title,
        url,
        category,
        description,
        mainFunctions,
        isPinned,
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/resources error:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
