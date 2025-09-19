import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActionType, ShiftType } from "@prisma/client";

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