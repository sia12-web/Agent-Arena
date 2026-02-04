-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "challengeType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProgramDrill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "presetInput" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramDrill_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgramEnrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ProgramEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramEnrollment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrillCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enrollmentId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "battleId" TEXT,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DrillCompletion_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ProgramEnrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DrillCompletion_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "ProgramDrill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DrillCompletion_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Battle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "challengeType" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "outputText" TEXT,
    "scoreTotal" INTEGER NOT NULL,
    "scoreBreakdown" TEXT NOT NULL,
    "programId" TEXT,
    "drillId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Battle_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Battle_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "ProgramDrill" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Battle_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Battle" ("agentId", "challengeType", "createdAt", "id", "inputText", "outputText", "scoreBreakdown", "scoreTotal") SELECT "agentId", "challengeType", "createdAt", "id", "inputText", "outputText", "scoreBreakdown", "scoreTotal" FROM "Battle";
DROP TABLE "Battle";
ALTER TABLE "new_Battle" RENAME TO "Battle";
CREATE INDEX "Battle_agentId_idx" ON "Battle"("agentId");
CREATE INDEX "Battle_programId_idx" ON "Battle"("programId");
CREATE INDEX "Battle_drillId_idx" ON "Battle"("drillId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "Program_challengeType_idx" ON "Program"("challengeType");

-- CreateIndex
CREATE INDEX "ProgramDrill_programId_idx" ON "ProgramDrill"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramDrill_programId_orderIndex_key" ON "ProgramDrill"("programId", "orderIndex");

-- CreateIndex
CREATE INDEX "ProgramEnrollment_userId_idx" ON "ProgramEnrollment"("userId");

-- CreateIndex
CREATE INDEX "ProgramEnrollment_agentId_idx" ON "ProgramEnrollment"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramEnrollment_programId_agentId_key" ON "ProgramEnrollment"("programId", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "DrillCompletion_battleId_key" ON "DrillCompletion"("battleId");

-- CreateIndex
CREATE INDEX "DrillCompletion_enrollmentId_idx" ON "DrillCompletion"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DrillCompletion_enrollmentId_drillId_key" ON "DrillCompletion"("enrollmentId", "drillId");
