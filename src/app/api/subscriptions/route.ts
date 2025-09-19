import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Save a push subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subscription } = body;

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: "userId and subscription are required" },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription format" },
        { status: 400 }
      );
    }

    // Upsert the subscription (create or update)
    const savedSubscription = await prisma.pushSubscription.upsert({
      where: {
        userId: userId,
      },
      update: {
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId: userId,
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({ success: true, id: savedSubscription.id });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all active push subscriptions
export async function GET() {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching push subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a push subscription
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.delete({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting push subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}