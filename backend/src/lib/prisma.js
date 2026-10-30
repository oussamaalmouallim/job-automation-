/** Client Prisma partagé. Gardé sur globalThis en dev pour ne pas ouvrir une connexion à chaque rechargement. */
import { PrismaClient } from '@prisma/client'

// PostgreSQL de docker-compose.yml si DATABASE_URL n'est pas réglée.
process.env.DATABASE_URL ||= 'postgresql://linkedai:linkedai@localhost:5433/linkedai'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
