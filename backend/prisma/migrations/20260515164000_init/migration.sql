-- CreateTable
CREATE TABLE "GeneratedPostLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT,
    "description" TEXT NOT NULL,
    "technologies" TEXT,
    "tone" TEXT,
    "model" TEXT,
    "generatedContent" TEXT NOT NULL,
    "rawResponse" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "GeneratedPostLog_userId_idx" ON "GeneratedPostLog"("userId");

-- CreateIndex
CREATE INDEX "GeneratedPostLog_createdAt_idx" ON "GeneratedPostLog"("createdAt");
