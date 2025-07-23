"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "../actions";

// Add interface for in-app notifications
interface InAppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerSW();
    }
  }, []);

  // Add message handler for in-app notifications
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "PUSH_RECEIVED") {
          const notificationData = event.data.notification;
          const newNotification: InAppNotification = {
            id: Date.now().toString(),
            title: notificationData.title || "Expense Tracker",
            body: notificationData.body || "New notification",
            timestamp: Date.now(),
          };

          setNotifications((prev) => [newNotification, ...prev].slice(0, 5)); // Keep only 5 recent notifications

          // Auto-remove notification after 5 seconds
          setTimeout(() => {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== newNotification.id)
            );
          }, 5000);
        }
      });
    }
  }, []);

  async function registerSW() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);

    // Convert PushSubscription to plain object for server action
    const subscriptionData = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.getKey("p256dh")
          ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!)))
          : "",
        auth: sub.getKey("auth")
          ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!)))
          : "",
      },
    };

    await subscribeUser(subscriptionData);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (message.trim() === "") {
      alert("Please enter a message");
      return;
    }
    await sendNotification(message);
    setMessage("");
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold">Push Notifications</h3>

      {/* In-app notifications display */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-start animate-in slide-in-from-top-2 duration-300"
            >
              <div className="flex-1">
                <div className="font-medium text-emerald-800">
                  {notification.title}
                </div>
                <div className="text-emerald-700 text-sm">
                  {notification.body}
                </div>
                <div className="text-emerald-600 text-xs mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-emerald-500 hover:text-emerald-700 ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {subscription ? (
        <>
          <p className="text-green-600">
            ✅ You are subscribed to push notifications.
          </p>
          <button
            onClick={unsubscribeFromPush}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Unsubscribe
          </button>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={sendTestNotification}
              className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
            >
              Send Test Notification
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-600">
            You are not subscribed to push notifications.
          </p>
          <button
            onClick={subscribeToPush}
            className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  );
}
