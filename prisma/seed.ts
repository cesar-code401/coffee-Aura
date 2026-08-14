import { PrismaClient, Role, Station, Zone } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('Seeding database...')

  // 1. Initial Admin User
  await prisma.user.upsert({
    where: { email: 'admin@coffeeos.com' },
    update: {},
    create: {
      name: 'Admin Supervisor',
      email: 'admin@coffeeos.com',
      role: Role.ADMIN,
    },
  })
  console.log('Admin user seeded')

  // 2. Tables
  const tablesData = [
    { number: 1, capacity: 2, zone: Zone.INTERIOR },
    { number: 2, capacity: 4, zone: Zone.INTERIOR },
    { number: 3, capacity: 4, zone: Zone.TERRACE },
    { number: 4, capacity: 6, zone: Zone.TERRACE },
    { number: 5, capacity: 2, zone: Zone.BAR },
    { number: 6, capacity: 2, zone: Zone.BAR },
  ]
  
  for (const t of tablesData) {
    const existingTable = await prisma.table.findFirst({ where: { number: t.number } })
    if (!existingTable) {
      await prisma.table.create({ data: t })
    }
  }
  console.log('Tables seeded')

  // 3. Categories
  const catHot = await prisma.category.upsert({
    where: { slug: 'hot-drinks' },
    update: {},
    create: { name: 'Bebidas Calientes', slug: 'hot-drinks', station: Station.BAR, sortOrder: 1 }
  })
  const catCold = await prisma.category.upsert({
    where: { slug: 'cold-drinks' },
    update: {},
    create: { name: 'Bebidas Frías', slug: 'cold-drinks', station: Station.BAR, sortOrder: 2 }
  })
  const catPastry = await prisma.category.upsert({
    where: { slug: 'pastries' },
    update: {},
    create: { name: 'Pastelería y Snacks', slug: 'pastries', station: Station.KITCHEN, sortOrder: 3 }
  })
  const catFood = await prisma.category.upsert({
    where: { slug: 'sandwiches' },
    update: {},
    create: { name: 'Tostadas y Sandwiches', slug: 'sandwiches', station: Station.KITCHEN, sortOrder: 4 }
  })
  console.log('Categories seeded')

  // 4. Modifier Groups & Options
  const modMilk = await prisma.modifierGroup.create({
    data: {
      name: 'Tipo de Leche', minSelection: 1, maxSelection: 1, isRequired: true,
      options: {
        create: [
          { name: 'Entera', priceDelta: 0.0 },
          { name: 'Deslactosada', priceDelta: 0.0 },
          { name: 'Avena', priceDelta: 0.50 },
          { name: 'Almendra', priceDelta: 0.50 },
        ]
      }
    }
  })

  const modSize = await prisma.modifierGroup.create({
    data: {
      name: 'Tamaño', minSelection: 1, maxSelection: 1, isRequired: true,
      options: {
        create: [
          { name: 'Regular', priceDelta: 0.0 },
          { name: 'Grande', priceDelta: 0.80 },
        ]
      }
    }
  })

  const modExtras = await prisma.modifierGroup.create({
    data: {
      name: 'Extras', minSelection: 0, maxSelection: 3, isRequired: false,
      options: {
        create: [
          { name: 'Shot Extra', priceDelta: 0.70 },
          { name: 'Jarabe Vainilla', priceDelta: 0.40 },
        ]
      }
    }
  })
  console.log('Modifier Groups seeded')

  // 5. Products
  const espresso = await prisma.product.create({
    data: { name: 'Espresso', description: 'Doble shot de espresso.', basePrice: 2.50, categoryId: catHot.id }
  })
  const latte = await prisma.product.create({
    data: { name: 'Latte', description: 'Espresso con leche vaporizada.', basePrice: 3.50, categoryId: catHot.id }
  })
  const flatWhite = await prisma.product.create({
    data: { name: 'Flat White', description: 'Espresso con leche texturizada.', basePrice: 3.80, categoryId: catHot.id }
  })
  const coldBrew = await prisma.product.create({
    data: { name: 'Cold Brew', description: 'Café extraído en frío por 12 horas.', basePrice: 4.00, categoryId: catCold.id }
  })
  const croissant = await prisma.product.create({
    data: { name: 'Croissant de Mantequilla', description: 'Clásico horneado del día.', basePrice: 2.80, categoryId: catPastry.id }
  })
  const avoToast = await prisma.product.create({
    data: { name: 'Tostón de Aguacate', description: 'Pan de masa madre con aguacate y huevo pochado.', basePrice: 7.50, categoryId: catFood.id }
  })

  // 6. Link Product to Modifiers
  // Espresso doesn't usually have milk modifier but let's link Size and Extras for all coffees
  const coffeeProducts = [espresso.id, latte.id, flatWhite.id, coldBrew.id]
  for (const pId of coffeeProducts) {
    if (pId !== espresso.id) { // Give milk to non-espressos
      await prisma.productModifierGroup.create({ data: { productId: pId, modifierGroupId: modMilk.id } })
    }
    await prisma.productModifierGroup.create({ data: { productId: pId, modifierGroupId: modSize.id } })
    await prisma.productModifierGroup.create({ data: { productId: pId, modifierGroupId: modExtras.id } })
  }
  
  console.log('Products seeded')
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
