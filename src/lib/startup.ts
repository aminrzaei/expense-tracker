import { startReminderCron } from "./cron-service";

let isInitialized = false;

export function initializeApp() {
  if (isInitialized) {
    console.log("⚠️ [STARTUP] App already initialized");
    return;
  }

  console.log("🚀 [STARTUP] Initializing app...");

  // Start the reminder cron service
  startReminderCron();

  isInitialized = true;
  console.log("✅ [STARTUP] App initialization complete");
}

export function getInitializationStatus() {
  return isInitialized;
}
