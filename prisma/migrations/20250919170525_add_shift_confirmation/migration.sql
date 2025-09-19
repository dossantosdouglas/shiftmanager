-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_shifts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeName" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "shiftDate" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "shiftType" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_shifts" ("actionType", "createdAt", "employeeName", "endTime", "id", "shiftDate", "shiftType", "startTime", "updatedAt") SELECT "actionType", "createdAt", "employeeName", "endTime", "id", "shiftDate", "shiftType", "startTime", "updatedAt" FROM "shifts";
DROP TABLE "shifts";
ALTER TABLE "new_shifts" RENAME TO "shifts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
