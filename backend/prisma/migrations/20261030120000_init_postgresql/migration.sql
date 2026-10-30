-- CreateTable
CREATE TABLE "GeneratedPostLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT,
    "description" TEXT NOT NULL,
    "technologies" TEXT,
    "tone" TEXT,
    "model" TEXT,
    "generatedContent" TEXT NOT NULL,
    "rawResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedPostLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedPostLog_userId_idx" ON "GeneratedPostLog"("userId");

-- CreateIndex
CREATE INDEX "GeneratedPostLog_createdAt_idx" ON "GeneratedPostLog"("createdAt");

