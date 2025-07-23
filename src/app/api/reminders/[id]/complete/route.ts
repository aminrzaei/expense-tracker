import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function calculateNextDueDate(current: Date, frequency: string): Date {
  const next = new Date(current);

  switch (frequency) {
    case "minutely":
      next.setMinutes(next.getMinutes() + 1);
      break;
    case "hourly":
      next.setHours(next.getHours() + 1);
      break;
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }

  return next;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminderId = params.id;

    // Get the reminder to check ownership and get current details
    const reminder = await prisma.reminder.findFirst({
      where: {
        id: reminderId,
        userId: session.user.id,
      },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(
      reminder.nextDueDate,
      reminder.frequency
    );

    // Update the reminder with the new due date
    const updatedReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        nextDueDate: nextDueDate,
      },
    });

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error("Error completing reminder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
