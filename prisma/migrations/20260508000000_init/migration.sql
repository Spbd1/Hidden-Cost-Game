-- CreateTable
CREATE TABLE "ResearchSubmission" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "exportVersion" TEXT NOT NULL,
    "consentVersion" TEXT,
    "assignedDisplayedProfile" TEXT,
    "assignedHiddenProfile" TEXT,
    "completedGameRounds" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,
    "appVersion" TEXT,
    "userAgentHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchSubmission_sessionId_idx" ON "ResearchSubmission"("sessionId");

-- CreateIndex
CREATE INDEX "ResearchSubmission_schemaVersion_idx" ON "ResearchSubmission"("schemaVersion");

-- CreateIndex
CREATE INDEX "ResearchSubmission_assignedHiddenProfile_idx" ON "ResearchSubmission"("assignedHiddenProfile");

-- CreateIndex
CREATE INDEX "ResearchSubmission_submittedAt_idx" ON "ResearchSubmission"("submittedAt");
