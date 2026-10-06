-- CreateTable
CREATE TABLE "AppSource" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "feedPath" TEXT NOT NULL DEFAULT '/api/admin-feed',
    "openUrl" TEXT,
    "extraHeaders" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionLog" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "amount" DECIMAL(14,2),
    "ok" BOOLEAN NOT NULL,
    "response" TEXT,
    "latencyMs" INTEGER,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlagAck" (
    "id" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "ackedBy" TEXT NOT NULL,
    "ackedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "until" TIMESTAMP(3),

    CONSTRAINT "FlagAck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerNote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "app" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "dueAt" TIMESTAMP(3),

    CONSTRAINT "OwnerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "app" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "latencyMs" INTEGER,
    "pendingApprovals" INTEGER NOT NULL DEFAULT 0,
    "pendingAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "criticalFlags" INTEGER NOT NULL DEFAULT 0,
    "warningFlags" INTEGER NOT NULL DEFAULT 0,
    "kpis" JSONB,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppSource_key_key" ON "AppSource"("key");

-- CreateIndex
CREATE INDEX "ActionLog_at_idx" ON "ActionLog"("at");

-- CreateIndex
CREATE INDEX "ActionLog_app_targetId_idx" ON "ActionLog"("app", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagAck_app_flagId_key" ON "FlagAck"("app", "flagId");

-- CreateIndex
CREATE INDEX "OwnerNote_done_pinned_idx" ON "OwnerNote"("done", "pinned");

-- CreateIndex
CREATE INDEX "Snapshot_app_at_idx" ON "Snapshot"("app", "at");
