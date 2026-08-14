import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function updateImages() {
  const products = [
    { name: 'Espresso', file: '/images/products/espresso.jpg' },
    { name: 'Latte', file: '/images/products/latte.jpg' },
    { name: 'Flat White', file: '/images/products/flat_white.jpg' },
    { name: 'Cold Brew', file: '/images/products/cold_brew.jpg' },
    { name: 'Croissant de Mantequilla', file: '/images/products/croissant.jpg' },
    { name: 'Tostón de Aguacate', file: '/images/products/avo_toast.jpg' }
  ];

  for (const p of products) {
    const product = await prisma.product.findFirst({ where: { name: p.name } });
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: p.file }
      });
      console.log(`Updated ${p.name}`);
    }
  }
}

updateImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
