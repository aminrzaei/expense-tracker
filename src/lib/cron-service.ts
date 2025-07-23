import * as cron from "node-cron";
import { prisma } from "./prisma";
import { sendUserNotification } from "@/app/actions";

let cronJob: cron.ScheduledTask | null = null;

// Calculate next due date based on frequency
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

// Main reminder checking function
async function checkReminders() {
  try {
    console.log(
      "🔍 [CRON] Checking for due reminders...",
      new Date().toISOString()
    );

    // Find all active reminders that are due
    const dueReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (dueReminders.length === 0) {
      console.log("📭 [CRON] No due reminders found");
      return;
    }

    console.log(`📋 [CRON] Found ${dueReminders.length} due reminders`);

    let processedCount = 0;

    for (const reminder of dueReminders) {
      try {
        console.log(
          `⏰ [CRON] Processing: ${reminder.title} (${reminder.frequency}) for ${reminder.user.email}`
        );

        // Send notification to user
        const message = reminder.amount
          ? `یادآوری: ${
              reminder.title
            } - ${reminder.amount.toLocaleString()} تومان`
          : `یادآوری: ${reminder.title}`;

        await sendUserNotification(
          reminder.userId,
          "💰 یادآوری هزینه",
          message,
          {
            type: "reminder",
            reminderId: reminder.id,
            frequency: reminder.frequency,
          }
        );

        // Calculate next due date based on frequency
        const nextDue = calculateNextDueDate(
          reminder.nextDueDate,
          reminder.frequency
        );

        // Update reminder with new due date
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { nextDueDate: nextDue },
        });

        console.log(
          `✅ [CRON] Processed: ${
            reminder.title
          }, next due: ${nextDue.toISOString()}`
        );
        processedCount++;
      } catch (error) {
        console.error(
          `❌ [CRON] Error processing reminder ${reminder.id}:`,
          error
        );
      }
    }

    console.log(
      `📊 [CRON] Summary: Processed ${processedCount}/${dueReminders.length} reminders`
    );
  } catch (error) {
    console.error("💥 [CRON] Error in reminder check:", error);
  }
}

// Start the cron job
export function startReminderCron() {
  if (cronJob) {
    console.log("⚠️ [CRON] Cron job already running");
    return;
  }

  // Run every minute: '* * * * *'
  // For testing, you can use '*/10 * * * * *' for every 10 seconds
  cronJob = cron.schedule(
    "* * * * *",
    async () => {
      await checkReminders();
    },
    {
      timezone: "Asia/Tehran", // Iranian timezone
    }
  );

  console.log("🚀 [CRON] Reminder cron job started - running every minute");

  // Run once immediately for testing
  setTimeout(() => {
    console.log("🧪 [CRON] Running initial check...");
    checkReminders();
  }, 2000); // Wait 2 seconds after startup
}

// Stop the cron job
export function stopReminderCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log("🛑 [CRON] Reminder cron job stopped");
  }
}

// Get cron job status
export function getCronStatus() {
  return {
    isRunning: cronJob !== null && cronJob.getStatus() === "scheduled",
    nextRun: cronJob ? "Every minute" : "Not scheduled",
  };
}

// Manual trigger for testing
export async function triggerReminderCheck() {
  console.log("🧪 [MANUAL] Manually triggering reminder check...");
  await checkReminders();
}
