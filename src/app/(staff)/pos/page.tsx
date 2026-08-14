import { prisma } from "@/lib/prisma";
import { PosClient } from "./PosClient";

export const revalidate = 0; // POS should not be cached generally

export default async function PosPage() {
  const [categories, tables] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { isActive: true },
          include: {
            modifierGroups: {
              include: {
                modifierGroup: {
                  include: { options: true }
                }
              }
            }
          }
        }
      }
    }),
    prisma.table.findMany({
      where: { isActive: true },
      orderBy: { number: 'asc' }
    })
  ]);

  return (
    <main className="h-screen w-full overflow-hidden selection:bg-primary/30">
      <PosClient categories={categories as any} tables={tables as any} />
    </main>
  );
}
