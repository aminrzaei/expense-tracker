import { NextResponse } from "next/server";
import { triggerReminderCheck, getCronStatus } from "@/lib/cron-service";

// Test endpoint to manually trigger reminder checking
// Visit: http://localhost:3000/api/test-reminders
export async function GET() {
  try {
    console.log("🧪 [TEST] Manual reminder check triggered via API");

    // Get cron status
    const cronStatus = getCronStatus();

    // Trigger the reminder check manually
    await triggerReminderCheck();

    const response = {
      success: true,
      message: "Manual reminder check completed via Node.js cron service",
      cronStatus: {
        isRunning: cronStatus.isRunning,
        nextRun: cronStatus.nextRun,
        type: "Node.js cron (not Vercel)",
        timezone: "Asia/Tehran",
      },
      timestamp: new Date().toISOString(),
      note: "Check server console logs for detailed processing information",
    };

    console.log("📊 [TEST] Manual trigger completed:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 [TEST] Error in manual reminder check:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal error",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
