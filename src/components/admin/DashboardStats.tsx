"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Banknote } from "lucide-react";

interface DashboardStatsProps {
  ordersToday: number;
  totalSales: number;
  activeShift: any;
}

export function DashboardStats({ ordersToday, totalSales, activeShift }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-sm border-stone-200/60 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-stone-500">Ventas Totales (Hoy)</CardTitle>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-stone-900">${totalSales.toFixed(2)}</div>
          <p className="text-xs text-stone-400 mt-1">Incluye todos los métodos de pago</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-stone-200/60 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-stone-500">Órdenes Procesadas</CardTitle>
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-stone-900">{ordersToday}</div>
          <p className="text-xs text-stone-400 mt-1">En sucursal y online</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-stone-200/60 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -mr-16 -mt-16 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
          <CardTitle className="text-sm font-medium text-stone-500">Estado de Caja</CardTitle>
          <div className="h-10 w-10 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center">
            <Banknote className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-xl font-bold text-stone-900">
            {activeShift ? `Turno Abierto (${activeShift.openedBy})` : "Caja Cerrada"}
          </div>
          {activeShift && (
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              Fondo inicial: ${activeShift.startingCash.toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
