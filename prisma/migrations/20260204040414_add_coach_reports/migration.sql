-- CreateTable
CREATE TABLE "BattleCoachReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleId" TEXT NOT NULL,
    "strengthsJson" TEXT NOT NULL,
    "weaknessesJson" TEXT NOT NULL,
    "promptSuggestionsJson" TEXT NOT NULL,
    "nextDrillsJson" TEXT NOT NULL,
    "recommendedFocus" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BattleCoachReport_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BattleCoachReport_battleId_key" ON "BattleCoachReport"("battleId");

-- CreateIndex
CREATE INDEX "BattleCoachReport_battleId_idx" ON "BattleCoachReport"("battleId");

-- CreateIndex
CREATE INDEX "BattleCoachReport_recommendedFocus_idx" ON "BattleCoachReport"("recommendedFocus");
