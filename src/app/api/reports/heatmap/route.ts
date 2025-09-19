import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActionType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: {
      actionType: ActionType;
      shiftDate?: { gte?: Date; lte?: Date };
    } = {
      actionType: "CANCEL" as ActionType, // Only get cancellations for heat map
    };

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

    // Get all cancellations with time data
    const cancellations = await prisma.shift.findMany({
      where,
      select: {
        startTime: true,
        endTime: true,
        shiftDate: true,
      },
    });

    // Create heat map data structure
    // Days of week: 0 = Sunday, 1 = Monday, etc.
    // Hours: 0-23
    const heatMapData: number[][] = Array(7).fill(null).map(() => Array(24).fill(0));

    cancellations.forEach((cancellation) => {
      const date = new Date(cancellation.shiftDate);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Parse start time (format: "HH:MM")
      const startHour = parseInt(cancellation.startTime.split(':')[0], 10);
      
      // Increment the count for this day/hour combination
      heatMapData[dayOfWeek][startHour]++;
    });

    // Also provide hourly totals for better insights
    const hourlyTotals = Array(24).fill(0);
    const dailyTotals = Array(7).fill(0);

    heatMapData.forEach((day, dayIndex) => {
      day.forEach((hourCount, hourIndex) => {
        hourlyTotals[hourIndex] += hourCount;
        dailyTotals[dayIndex] += hourCount;
      });
    });

    return NextResponse.json({
      heatMapData,
      hourlyTotals,
      dailyTotals,
      totalCancellations: cancellations.length,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error) {
    console.error("Error generating heat map data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}