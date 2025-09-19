import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Configure web-push with VAPID keys only if they exist
if (process.env.VAPID_SUBJECT && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Notification API called");
    const body = await request.json();
    const { subscription, title, message, shiftId, employeeName } = body;

    console.log("📋 Notification data:", { title, message, hasSubscription: !!subscription });

    if (!subscription) {
      console.log("❌ No subscription provided");
      return NextResponse.json(
        { error: "Push subscription is required" },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title: title || "Shift Cancellation",
      body: message || "A shift has been cancelled",
      shiftId,
      employeeName,
      timestamp: new Date().toISOString()
    });

    console.log("📤 Sending push notification with payload:", payload);

    try {
      console.log("🔑 VAPID configured:", !!process.env.VAPID_PUBLIC_KEY);
      await webpush.sendNotification(subscription, payload);
      console.log("✅ Push notification sent successfully");
      
      return NextResponse.json(
        { message: "Push notification sent successfully" },
        { status: 200 }
      );
    } catch (error: unknown) {
      console.error("❌ Error sending push notification:", error);
      
      // Handle expired subscriptions
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 410) {
        // TODO: Remove expired subscription from database
        return NextResponse.json(
          { error: "Push subscription has expired" },
          { status: 410 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to send push notification" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in push notification endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get VAPID public key
export async function GET() {
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
}