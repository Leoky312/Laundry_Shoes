const { PrismaClient } = require('@prisma/client');

// Mencegah instansiasi ganda Prisma Client saat hot reload / nodemon
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
