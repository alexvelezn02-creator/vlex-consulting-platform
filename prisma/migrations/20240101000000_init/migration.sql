-- Init migration for Vlex Consulting Platform
CREATE TYPE "TargetType" AS ENUM ('PERSON', 'ORG_UNIT', 'PROCESS');
CREATE TYPE "RoleType" AS ENUM ('GERENCIA', 'PARES', 'AUTO');
CREATE TYPE "BottleneckReason" AS ENUM ('TIME', 'APPROVAL', 'INFO', 'QUALITY', 'RESOURCES', 'OTHER');

CREATE TABLE "Tenant" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "OrgUnit" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "parentId" TEXT REFERENCES "OrgUnit"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Person" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "orgUnitId" TEXT REFERENCES "OrgUnit"("id"),
  "name" TEXT NOT NULL,
  "title" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Process" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Instrument" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Section" (
  "id" TEXT PRIMARY KEY,
  "instrumentId" TEXT NOT NULL REFERENCES "Instrument"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

CREATE TABLE "Question" (
  "id" TEXT PRIMARY KEY,
  "sectionId" TEXT NOT NULL REFERENCES "Section"("id") ON DELETE CASCADE,
  "text" TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

CREATE TABLE "Campaign" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "targetType" "TargetType" NOT NULL,
  "instrumentId" TEXT NOT NULL REFERENCES "Instrument"("id"),
  "startsAt" TIMESTAMP NOT NULL,
  "endsAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "CampaignRole" (
  "id" TEXT PRIMARY KEY,
  "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
  "label" TEXT NOT NULL,
  "roleType" "RoleType" NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "CampaignTarget" (
  "id" TEXT PRIMARY KEY,
  "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
  "targetType" "TargetType" NOT NULL,
  "personId" TEXT REFERENCES "Person"("id"),
  "orgUnitId" TEXT REFERENCES "OrgUnit"("id"),
  "processId" TEXT REFERENCES "Process"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Token" (
  "id" TEXT PRIMARY KEY,
  "token" TEXT NOT NULL UNIQUE,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
  "targetId" TEXT NOT NULL REFERENCES "CampaignTarget"("id") ON DELETE CASCADE,
  "roleLabel" TEXT NOT NULL,
  "roleType" "RoleType" NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "usedAt" TIMESTAMP
);

CREATE TABLE "Response" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
  "targetId" TEXT NOT NULL REFERENCES "CampaignTarget"("id") ON DELETE CASCADE,
  "tokenId" TEXT NOT NULL REFERENCES "Token"("id") ON DELETE CASCADE,
  "roleType" "RoleType" NOT NULL,
  "roleLabel" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Answer" (
  "id" TEXT PRIMARY KEY,
  "responseId" TEXT NOT NULL REFERENCES "Response"("id") ON DELETE CASCADE,
  "questionId" TEXT NOT NULL REFERENCES "Question"("id") ON DELETE CASCADE,
  "score" INTEGER NOT NULL,
  "comment" TEXT
);

CREATE TABLE "DependencyNode" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "nodeType" "TargetType" NOT NULL,
  "nodeRefId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "DependencyEdge" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
  "targetId" TEXT NOT NULL REFERENCES "CampaignTarget"("id") ON DELETE CASCADE,
  "responseId" TEXT NOT NULL REFERENCES "Response"("id") ON DELETE CASCADE,
  "fromNodeId" TEXT NOT NULL REFERENCES "DependencyNode"("id") ON DELETE CASCADE,
  "toNodeId" TEXT NOT NULL REFERENCES "DependencyNode"("id") ON DELETE CASCADE,
  "isBottleneck" BOOLEAN NOT NULL DEFAULT FALSE,
  "bottleneckReason" "BottleneckReason",
  "optionalComment" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
