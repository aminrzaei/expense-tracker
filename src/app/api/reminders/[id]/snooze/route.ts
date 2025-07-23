import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminderId = params.id;

    // Get the reminder to check ownership
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

    // Snooze for 1 day (24 hours)
    const snoozeDate = new Date(reminder.nextDueDate);
    snoozeDate.setDate(snoozeDate.getDate() + 1);

    // Update the reminder with the snoozed date
    const updatedReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        nextDueDate: snoozeDate,
      },
    });

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error("Error snoozing reminder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
