import { PrismaClient, ActionType, ShiftType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create sample shift data
  const sampleShifts = [
    {
      employeeName: "John Doe",
      actionType: ActionType.ADD,
      shiftDate: new Date("2025-09-20"),
      startTime: "09:00",
      endTime: "17:00",
      shiftType: ShiftType.VOICE,
    },
    {
      employeeName: "Jane Smith",
      actionType: ActionType.MODIFY,
      shiftDate: new Date("2025-09-21"),
      startTime: "10:00",
      endTime: "18:00",
      shiftType: ShiftType.CHAT,
    },
    {
      employeeName: "Bob Johnson",
      actionType: ActionType.CANCEL,
      shiftDate: new Date("2025-09-22"),
      startTime: "08:00",
      endTime: "16:00",
      shiftType: ShiftType.VOICE,
    },
    {
      employeeName: "Alice Brown",
      actionType: ActionType.ADD,
      shiftDate: new Date("2025-09-23"),
      startTime: "14:00",
      endTime: "22:00",
      shiftType: ShiftType.CHAT,
    },
    {
      employeeName: "John Doe",
      actionType: ActionType.MODIFY,
      shiftDate: new Date("2025-09-24"),
      startTime: "11:00",
      endTime: "19:00",
      shiftType: ShiftType.VOICE,
    },
    {
      employeeName: "Jane Smith",
      actionType: ActionType.CANCEL,
      shiftDate: new Date("2025-09-25"),
      startTime: "09:00",
      endTime: "17:00",
      shiftType: ShiftType.CHAT,
    },
  ];

  for (const shift of sampleShifts) {
    await prisma.shift.create({
      data: shift,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });