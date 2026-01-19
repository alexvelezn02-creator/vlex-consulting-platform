-- Add scoring results tables

CREATE TABLE "CampaignResult" (
  "id" TEXT PRIMARY KEY,
  "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
  "targetId" TEXT NOT NULL REFERENCES "CampaignTarget"("id") ON DELETE CASCADE,
  "targetType" "TargetType" NOT NULL,
  "orgIndex" DOUBLE PRECISION,
  "blockGerencia" DOUBLE PRECISION,
  "blockPares" DOUBLE PRECISION,
  "blockAuto" DOUBLE PRECISION,
  "perceptionGap" DOUBLE PRECISION,
  "dependencyConcentration" DOUBLE PRECISION,
  "riskLowScore" BOOLEAN NOT NULL DEFAULT FALSE,
  "riskGapHigh" BOOLEAN NOT NULL DEFAULT FALSE,
  "missingRoleTypes" "RoleType"[] DEFAULT ARRAY[]::"RoleType"[],
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "QuestionScore" (
  "id" TEXT PRIMARY KEY,
  "campaignResultId" TEXT NOT NULL REFERENCES "CampaignResult"("id") ON DELETE CASCADE,
  "questionId" TEXT NOT NULL REFERENCES "Question"("id") ON DELETE CASCADE,
  "weightedScore" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "SectionScore" (
  "id" TEXT PRIMARY KEY,
  "campaignResultId" TEXT NOT NULL REFERENCES "CampaignResult"("id") ON DELETE CASCADE,
  "sectionId" TEXT NOT NULL REFERENCES "Section"("id") ON DELETE CASCADE,
  "weightedScore" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "RoleScore" (
  "id" TEXT PRIMARY KEY,
  "campaignResultId" TEXT NOT NULL REFERENCES "CampaignResult"("id") ON DELETE CASCADE,
  "roleType" "RoleType" NOT NULL,
  "roleLabel" TEXT NOT NULL,
  "averageScore" DOUBLE PRECISION NOT NULL,
  "responseCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "CampaignResult_campaignId_idx" ON "CampaignResult"("campaignId");
CREATE INDEX "CampaignResult_targetId_idx" ON "CampaignResult"("targetId");
CREATE INDEX "QuestionScore_campaignResultId_idx" ON "QuestionScore"("campaignResultId");
CREATE INDEX "SectionScore_campaignResultId_idx" ON "SectionScore"("campaignResultId");
CREATE INDEX "RoleScore_campaignResultId_idx" ON "RoleScore"("campaignResultId");
