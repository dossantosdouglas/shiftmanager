import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActionType, ShiftType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employee = searchParams.get("employee");
    const actionType = searchParams.get("actionType");
    const shiftType = searchParams.get("shiftType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: {
      employeeName?: { contains: string };
      actionType?: ActionType;
      shiftType?: ShiftType;
      shiftDate?: { gte?: Date; lte?: Date };
    } = {};

    if (employee) {
      where.employeeName = {
        contains: employee,
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

    // Get aggregated data
    const aggregatedData = await prisma.shift.groupBy({
      by: ['employeeName', 'actionType'],
      where,
      _count: {
        id: true,
      },
    });

    // Transform the data for better frontend consumption
    const reportData: Record<string, Record<string, number>> = {};

    aggregatedData.forEach((item) => {
      if (!reportData[item.employeeName]) {
        reportData[item.employeeName] = {
          CANCEL: 0,
          MODIFY: 0,
          ADD: 0,
          total: 0,
        };
      }
      reportData[item.employeeName][item.actionType] = item._count.id;
      reportData[item.employeeName].total += item._count.id;
    });

    // Convert to array format for easier frontend handling
    const formattedData = Object.entries(reportData).map(([employeeName, counts]) => ({
      employeeName,
      ...counts,
    }));

    return NextResponse.json({
      summary: formattedData,
      totalRecords: aggregatedData.reduce((sum, item) => sum + item._count.id, 0),
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}