import { prisma } from '../src/lib/prisma.js'

const logs = await prisma.generatedPostLog.findMany({
  orderBy: { createdAt: 'desc' },
  take: 20
})

console.table(logs.map((log) => ({
  id: log.id,
  type: log.type,
  technologies: log.technologies,
  description: log.description,
  createdAt: log.createdAt
})))

await prisma.$disconnect()
