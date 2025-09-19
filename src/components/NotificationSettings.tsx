"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePushNotifications } from "@/contexts/PushNotificationContext";
import { Bell, BellOff, Check, X, TestTube } from "lucide-react";

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeUser,
    unsubscribeUser,
    sendTestNotification,
  } = usePushNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const permissionGranted = await requestPermission();
      if (permissionGranted) {
        await subscribeUser();
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      await unsubscribeUser();
    } catch (error) {
      console.error("Error disabling notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      await sendTestNotification();
    } catch (error) {
      console.error("Error sending test notification:", error);
      alert("Failed to send test notification. Please try again.");
    } finally {
      setTestingNotification(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Configure push notifications for shift cancellations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-yellow-600">
            <X className="h-4 w-4" />
            <span>Push notifications are not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <Check className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Denied
          </Badge>
        );
      default:
        return <Badge variant="outline">Not Requested</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified when shift cancellations are made
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notification Status</p>
            <p className="text-sm text-muted-foreground">
              Current permission and subscription status
            </p>
          </div>
          {getPermissionBadge()}
        </div>

        {permission === "denied" && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Notifications are blocked. Please enable them in your browser
              settings and refresh the page.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {subscription ? (
            <>
              <Button
                onClick={handleDisableNotifications}
                variant="outline"
                disabled={isLoading}
              >
                <BellOff className="h-4 w-4 mr-2" />
                Disable Notifications
              </Button>
              <Button
                onClick={handleTestNotification}
                variant="outline"
                disabled={testingNotification}
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testingNotification ? "Sending..." : "Test Notification"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEnableNotifications}
              disabled={isLoading || permission === "denied"}
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? "Enabling..." : "Enable Notifications"}
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">You will receive notifications for:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Shift cancellations made by any employee</li>
            <li>Important shift management updates</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
