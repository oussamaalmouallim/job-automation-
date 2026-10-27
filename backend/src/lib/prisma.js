/** Client Prisma partagé. Gardé sur globalThis en dev pour ne pas ouvrir une connexion à chaque rechargement. */
import { PrismaClient } from '@prisma/client'

process.env.DATABASE_URL ||= 'file:./dev.db'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
