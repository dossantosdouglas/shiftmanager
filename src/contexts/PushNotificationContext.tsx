"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface PushNotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<boolean>;
  subscribeUser: () => Promise<boolean>;
  unsubscribeUser: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
}

const PushNotificationContext = createContext<
  PushNotificationContextType | undefined
>(undefined);

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const { user } = useAuth();

  useEffect(() => {
    // Check if push notifications are supported
    if (typeof window !== "undefined") {
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);

        // Register service worker
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration);

            // Check for existing subscription
            return registration.pushManager.getSubscription();
          })
          .then((existingSubscription) => {
            if (existingSubscription) {
              setSubscription(existingSubscription);
            }
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      }
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Push notifications are not supported");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const subscribeUser = async (): Promise<boolean> => {
    if (!isSupported || permission !== "granted" || !user) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error("Service worker not registered");
      }

      // Get VAPID public key from server
      const response = await fetch("/api/notifications");
      const { publicKey } = await response.json();

      const applicationServerKey = urlB64ToUint8Array(publicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      setSubscription(subscription);

      // Store subscription in localStorage for persistence
      localStorage.setItem("pushSubscription", JSON.stringify(subscription));

      // Save subscription to database
      try {
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.name,
            subscription: subscription.toJSON(),
          }),
        });
      } catch (dbError) {
        console.error("Failed to save subscription to database:", dbError);
        // Don't fail the subscription if database save fails
      }

      return true;
    } catch (error) {
      console.error("Error subscribing user:", error);
      return false;
    }
  };

  const unsubscribeUser = async (): Promise<boolean> => {
    if (!subscription || !user) {
      return false;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Remove from localStorage
      localStorage.removeItem("pushSubscription");

      // Remove from database
      try {
        await fetch(
          `/api/subscriptions?userId=${encodeURIComponent(user.name)}`,
          {
            method: "DELETE",
          }
        );
      } catch (dbError) {
        console.error("Failed to remove subscription from database:", dbError);
        // Don't fail the unsubscription if database removal fails
      }

      return true;
    } catch (error) {
      console.error("Error unsubscribing user:", error);
      return false;
    }
  };

  const sendTestNotification = async (): Promise<void> => {
    if (!subscription) {
      throw new Error("User is not subscribed to push notifications");
    }

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription,
          title: "Test Notification",
          message:
            "This is a test push notification from Shift Management Panel",
        }),
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      throw error;
    }
  };

  const value = {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeUser,
    unsubscribeUser,
    sendTestNotification,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotifications() {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error(
      "usePushNotifications must be used within a PushNotificationProvider"
    );
  }
  return context;
}

// Utility function to convert VAPID key
function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
