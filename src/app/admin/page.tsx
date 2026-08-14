import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch metrics
  const [ordersToday, paymentsToday, activeShift] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: today } }
    }),
    prisma.payment.aggregate({
      where: { createdAt: { gte: today }, status: PaymentStatus.PAID },
      _sum: { amount: true }
    }),
    prisma.shift.findFirst({
      where: { status: 'OPEN' }
    })
  ]);

  const totalSales = paymentsToday._sum.amount || 0;

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif tracking-tight text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-2">Resumen de operaciones y ventas del día.</p>
      </div>

      <DashboardStats 
        ordersToday={ordersToday} 
        totalSales={totalSales} 
        activeShift={activeShift} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/60">
          <h3 className="font-bold text-stone-800 mb-4">Ventas por Método de Pago</h3>
          <div className="h-48 flex items-center justify-center text-stone-400 bg-stone-50 rounded-lg border border-stone-100">
            [Gráfico de Ventas]
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/60">
          <h3 className="font-bold text-stone-800 mb-4">Productos más vendidos</h3>
          <div className="h-48 flex items-center justify-center text-stone-400 bg-stone-50 rounded-lg border border-stone-100">
            [Gráfico de Productos]
          </div>
        </div>
      </div>
    </main>
  );
}
