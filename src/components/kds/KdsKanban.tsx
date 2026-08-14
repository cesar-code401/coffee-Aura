"use client";

import { OrderStatus } from "@prisma/client";
import { KdsCard } from "./KdsCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface KdsKanbanProps {
  orders: any[];
  audioEnabled: boolean;
}

export function KdsKanban({ orders, audioEnabled }: KdsKanbanProps) {
  const received = orders.filter(o => o.status === OrderStatus.RECEIVED);
  const inProgress = orders.filter(o => o.status === OrderStatus.IN_PROGRESS);
  const ready = orders.filter(o => o.status === OrderStatus.READY);

  const Column = ({ title, items, colorClass }: { title: string, items: any[], colorClass: string }) => (
    <div className="flex flex-col h-full bg-slate-950/50 min-w-[320px] max-w-[360px] rounded-xl border border-slate-800 overflow-hidden shrink-0">
      <div className={`p-3 border-b-4 ${colorClass} bg-slate-900 flex justify-between items-center`}>
        <h2 className="font-bold text-slate-100 tracking-wide uppercase">{title}</h2>
        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
          {items.length}
        </span>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="flex flex-col gap-3 pb-8">
          {items.map(order => (
            <KdsCard key={order.id} order={order} audioEnabled={audioEnabled} />
          ))}
          {items.length === 0 && (
            <div className="text-center text-slate-600 mt-12 text-sm">No orders</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <ScrollArea className="w-full h-full pb-4">
      <div className="flex h-full gap-6 p-4">
        <Column title="New Orders" items={received} colorClass="border-blue-500" />
        <Column title="In Progress" items={inProgress} colorClass="border-yellow-500" />
        <Column title="Ready / Calling" items={ready} colorClass="border-green-500" />
      </div>
      <ScrollBar orientation="horizontal" className="bg-slate-900" />
    </ScrollArea>
  );
}
