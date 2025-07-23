import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: session.user.id },
      orderBy: { nextDueDate: "asc" },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, amount, frequency, nextDueDate } = await request.json();

    if (!title || !frequency || !nextDueDate) {
      return NextResponse.json(
        {
          error: "Title, frequency, and nextDueDate are required",
        },
        { status: 400 }
      );
    }

    // Validate frequency
    const validFrequencies = [
      "minutely",
      "hourly",
      "daily",
      "weekly",
      "monthly",
      "yearly",
    ];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json(
        {
          error:
            "Invalid frequency. Must be minutely, hourly, daily, weekly, monthly, or yearly",
        },
        { status: 400 }
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        title,
        amount: amount || null,
        frequency,
        nextDueDate: new Date(nextDueDate),
        userId: session.user.id,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
