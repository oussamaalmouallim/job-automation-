import { PrismaClient } from '@prisma/client'

process.env.DATABASE_URL ||= 'file:./dev.db'

const prisma = new PrismaClient()

await prisma.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS "GeneratedPostLog" (
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
  )
`)

await prisma.$executeRawUnsafe(`
  CREATE INDEX IF NOT EXISTS "GeneratedPostLog_userId_idx"
  ON "GeneratedPostLog"("userId")
`)

await prisma.$executeRawUnsafe(`
  CREATE INDEX IF NOT EXISTS "GeneratedPostLog_createdAt_idx"
  ON "GeneratedPostLog"("createdAt")
`)

await prisma.$disconnect()

console.log('SQLite database is ready.')
