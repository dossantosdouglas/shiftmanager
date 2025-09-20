import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActionType, ShiftType } from "@prisma/client";
import webpush from "web-push";

// Configure web-push with VAPID keys only if they exist
if (process.env.VAPID_SUBJECT && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Function to send push notification directly
async function sendPushNotification(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }, title: string, message: string, shiftId: string, employeeName: string) {
  try {
    const payload = JSON.stringify({
      title: title,
      body: message,
      shiftId,
      employeeName,
      timestamp: new Date().toISOString()
    });

    console.log("📤 Sending push notification with payload:", payload);
    await webpush.sendNotification(subscription, payload);
    console.log("✅ Push notification sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    return false;
  }
}

// Helper function to get stored push subscriptions
// Get active push subscriptions from database
async function getStoredSubscriptions(): Promise<{ endpoint: string; keys: { p256dh: string; auth: string } }[]> {
  try {
    console.log("📊 Fetching push subscriptions from database...");
    const subscriptions = await prisma.pushSubscription.findMany();
    console.log("📊 Raw subscriptions from DB:", subscriptions.length);
    
    const formattedSubs = subscriptions.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    }));
    
    console.log("📊 Formatted subscriptions:", formattedSubs.length);
    return formattedSubs;
  } catch (error) {
    console.error("❌ Error fetching subscriptions:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeName, actionType, shiftDate, startTime, endTime, shiftType } = body;

    // Validate required fields
    if (!employeeName || !actionType || !shiftDate || !startTime || !endTime || !shiftType) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate enums
    if (!Object.values(ActionType).includes(actionType)) {
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 }
      );
    }

    if (!Object.values(ShiftType).includes(shiftType)) {
      return NextResponse.json(
        { error: "Invalid shift type" },
        { status: 400 }
      );
    }

    const shift = await prisma.shift.create({
      data: {
        employeeName,
        actionType,
        shiftDate: new Date(shiftDate),
        startTime,
        endTime,
        shiftType,
      },
    });

    // Send push notification for cancellations
    if (actionType === ActionType.CANCEL) {
      console.log("🔔 Cancellation detected, attempting to send notifications...");
      try {
        // Get all users who might have push subscriptions
        const subscriptions = await getStoredSubscriptions();
        console.log("📋 Found subscriptions:", subscriptions.length);
        
        if (subscriptions.length === 0) {
          console.log("⚠️ No subscriptions found in database");
        }
        
        for (const subscription of subscriptions) {
          console.log("📤 Sending notification to subscription");
          const result = await sendPushNotification(
            subscription as { endpoint: string; keys: { p256dh: string; auth: string } },
            "Shift Cancellation Alert",
            `${employeeName} has cancelled a ${shiftType.toLowerCase()} shift on ${new Date(shiftDate).toLocaleDateString()}`,
            shift.id,
            employeeName
          );
          
          if (result) {
            console.log("✅ Notification sent successfully");
          } else {
            console.log("❌ Failed to send notification");
          }
        }
      } catch (error) {
        console.error("❌ Error sending cancellation notifications:", error);
        // Don't fail the shift creation if notifications fail
      }
    }

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employee = searchParams.get("employee");
    const actionType = searchParams.get("actionType");
    const shiftType = searchParams.get("shiftType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: {
      employeeName?: { contains: string; mode?: "insensitive" };
      actionType?: ActionType;
      shiftType?: ShiftType;
      shiftDate?: { gte?: Date; lte?: Date };
    } = {};

    if (employee) {
      where.employeeName = {
        contains: employee,
        mode: "insensitive",
      };
    }

    if (actionType && Object.values(ActionType).includes(actionType as ActionType)) {
      where.actionType = actionType as ActionType;
    }

    if (shiftType && Object.values(ShiftType).includes(shiftType as ShiftType)) {
      where.shiftType = shiftType as ShiftType;
    }

    if (startDate && endDate) {
      where.shiftDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.shiftDate = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.shiftDate = {
        lte: new Date(endDate),
      };
    }

    const shifts = await prisma.shift.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, confirmed } = body;

    // Validate required fields
    if (!id || typeof confirmed !== "boolean") {
      return NextResponse.json(
        { error: "Shift ID and confirmed status are required" },
        { status: 400 }
      );
    }

    // Update the shift confirmation status
    const updatedShift = await prisma.shift.update({
      where: {
        id: id,
      },
      data: {
        confirmed: confirmed,
      },
    });

    return NextResponse.json(updatedShift);
  } catch (error) {
    console.error("Error updating shift confirmation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Shift ID is required" },
        { status: 400 }
      );
    }

    // Check if the shift exists
    const existingShift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!existingShift) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }

    // Delete the shift
    await prisma.shift.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Shift deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting shift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}