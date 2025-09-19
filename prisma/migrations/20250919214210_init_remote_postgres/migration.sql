-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('CANCEL', 'MODIFY', 'ADD');

-- CreateEnum
CREATE TYPE "public"."ShiftType" AS ENUM ('VOICE', 'CHAT');

-- CreateTable
CREATE TABLE "public"."shifts" (
    "id" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "actionType" "public"."ActionType" NOT NULL,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "shiftType" "public"."ShiftType" NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);
