"use server";

import webpush from "web-push";

// Set VAPID details for web push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Define the serialized subscription type
interface SerializedSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// In a production environment, you would want to store subscriptions in a database
// For now, we'll use a simple in-memory storage (this will reset on server restart)
let subscriptions: SerializedSubscription[] = [];

export async function subscribeUser(subscriptionData: SerializedSubscription) {
  // Add subscription to our storage
  subscriptions.push(subscriptionData);
  console.log("User subscribed to push notifications");
  return { success: true };
}

export async function unsubscribeUser() {
  // In a real app, you would identify and remove the specific user's subscription
  // For now, we'll clear all subscriptions
  subscriptions = [];
  console.log("User unsubscribed from push notifications");
  return { success: true };
}

export async function sendNotification(message: string) {
  if (subscriptions.length === 0) {
    throw new Error("No subscriptions available");
  }

  try {
    // Send notification to all subscribed users
    const promises = subscriptions.map((subscriptionData) => {
      // Convert back to web-push format
      const subscription = {
        endpoint: subscriptionData.endpoint,
        keys: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
        },
      };

      return webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Expense Tracker",
          body: message,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        })
      );
    });

    await Promise.all(promises);
    console.log("Notifications sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
