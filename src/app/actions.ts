"use server";

import webpush from "web-push";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function subscribeUser(subscriptionData: SerializedSubscription) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    // Store subscription in database
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: subscriptionData.endpoint,
        },
      },
      update: {
        p256dhKey: subscriptionData.keys.p256dh,
        authKey: subscriptionData.keys.auth,
      },
      create: {
        userId: session.user.id,
        endpoint: subscriptionData.endpoint,
        p256dhKey: subscriptionData.keys.p256dh,
        authKey: subscriptionData.keys.auth,
      },
    });

    console.log("User subscribed to push notifications");
    return { success: true };
  } catch (error) {
    console.error("Error subscribing user:", error);
    return { success: false, error: "Failed to subscribe" };
  }
}

export async function unsubscribeUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    // Remove user's subscriptions from database
    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id },
    });

    console.log("User unsubscribed from push notifications");
    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

export async function sendNotification(message: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  return await sendUserNotification(
    session.user.id,
    "💰 مدیریت هزینه‌ها",
    message
  );
}

export async function sendUserNotification(
  userId: string,
  title: string,
  body: string,
  data?: object
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      console.log(`No subscriptions found for user ${userId}`);
      return { success: true, message: "No subscriptions found" };
    }

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dhKey,
              auth: sub.authKey,
            },
          },
          JSON.stringify({
            title,
            body,
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            data,
          })
        );
      } catch (error: unknown) {
        console.error(
          `Failed to send notification to subscription ${sub.id}:`,
          error
        );
        // Remove invalid subscriptions
        if (
          error instanceof Error &&
          "statusCode" in error &&
          (error as any).statusCode === 410
        ) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    });

    await Promise.all(promises);
    console.log("Notifications sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
