import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, amount, categoryId, description } = await request.json();

    if (!title || !amount) {
      return NextResponse.json(
        { error: "Title and amount are required" },
        { status: 400 }
      );
    }

    // Create default categories if they don't exist
    const defaultCategories = [
      { id: "food", name: "🍽️ غذا و نوشیدنی" },
      { id: "transport", name: "🚗 حمل و نقل" },
      { id: "shopping", name: "🛍️ خرید" },
      { id: "bills", name: "📄 قبوض" },
      { id: "health", name: "🏥 سلامت" },
      { id: "entertainment", name: "🎬 سرگرمی" },
      { id: "education", name: "📚 آموزش" },
      { id: "other", name: "📦 سایر" },
    ];

    // Ensure default categories exist
    for (const cat of defaultCategories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
        },
      });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseInt(amount),
        categoryId: categoryId || "other",
        description,
        userId: session.user.id,
      },
      include: { category: true },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
