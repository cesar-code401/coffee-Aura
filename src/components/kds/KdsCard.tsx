"use client";

import { useEffect, useState } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/server/actions/kds.actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, CheckCircle2, PlayCircle } from "lucide-react";
import { playAudioAlert } from "@/lib/sound";

interface KdsCardProps {
  order: any;
  audioEnabled: boolean;
}

export function KdsCard({ order, audioEnabled }: KdsCardProps) {
  const [elapsedMins, setElapsedMins] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const calcElapsed = () => {
      const now = new Date().getTime();
      const orderTime = new Date(order.createdAt).getTime();
      const diffMins = Math.floor((now - orderTime) / 60000);
      setElapsedMins(diffMins);
    };
    
    calcElapsed();
    const interval = setInterval(calcElapsed, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [order.createdAt]);

  useEffect(() => {
    if (elapsedMins === 10 && order.status === OrderStatus.RECEIVED && audioEnabled) {
      playAudioAlert('urgent');
    }
  }, [elapsedMins, order.status, audioEnabled]);

  // Determine SLA Visual Border
  let borderColorClass = "border-green-500";
  if (elapsedMins >= 5 && elapsedMins < 10) borderColorClass = "border-yellow-500";
  if (elapsedMins >= 10) borderColorClass = "border-red-500 animate-pulse-slow"; // Assume tailwind configured for this or just raw classes
  if (order.status === OrderStatus.READY) borderColorClass = "border-slate-600";

  const handleNextStatus = async () => {
    setIsUpdating(true);
    let nextStatus: OrderStatus = OrderStatus.IN_PROGRESS;
    if (order.status === OrderStatus.RECEIVED) nextStatus = OrderStatus.IN_PROGRESS;
    else if (order.status === OrderStatus.IN_PROGRESS) nextStatus = OrderStatus.READY;
    else if (order.status === OrderStatus.READY) nextStatus = OrderStatus.COMPLETED;

    await updateOrderStatus(order.id, nextStatus);
    setIsUpdating(false);
  };

  const getActionConfig = () => {
    if (order.status === OrderStatus.RECEIVED) return { label: "Start", icon: <PlayCircle className="mr-2 h-4 w-4"/>, color: "bg-blue-600 hover:bg-blue-700" };
    if (order.status === OrderStatus.IN_PROGRESS) return { label: "Ready", icon: <ChefHat className="mr-2 h-4 w-4"/>, color: "bg-yellow-600 hover:bg-yellow-700" };
    if (order.status === OrderStatus.READY) return { label: "Done", icon: <CheckCircle2 className="mr-2 h-4 w-4"/>, color: "bg-green-600 hover:bg-green-700" };
    return { label: "Update", icon: null, color: "bg-slate-600" };
  };

  const config = getActionConfig();

  return (
    <Card className={`flex flex-col bg-slate-900 border-2 ${borderColorClass} text-slate-100 shadow-xl overflow-hidden min-w-[280px] max-w-[320px] transition-all`}>
      <CardHeader className="p-3 bg-slate-950 flex flex-row items-center justify-between border-b border-slate-800">
        <div>
          <h3 className="font-bold text-lg leading-none">#{order.orderNumber}</h3>
          <span className="text-xs text-slate-400 font-semibold tracking-wider">
            {order.type.replace('_', ' ')}
            {order.table ? ` • T${order.table.number}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-300 font-mono font-bold bg-slate-800 px-2 py-1 rounded-md">
          <Clock className="h-4 w-4" />
          <span>{elapsedMins}m</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[300px] no-scrollbar">
          {order.items.map((item: any) => (
            <div key={item.id} className="text-sm border-b border-slate-800 pb-2 last:border-0">
              <div className="flex gap-2 font-semibold text-white">
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">{item.quantity}</span>
                <span>{item.product.name}</span>
              </div>
              
              {item.modifiers.length > 0 && (
                <div className="pl-6 mt-1 flex flex-wrap gap-1">
                  {item.modifiers.map((m: any) => (
                    <span key={m.id} className="text-xs bg-primary/20 text-primary-foreground px-1.5 rounded-sm whitespace-nowrap">
                      + {m.modifierOption.name}
                    </span>
                  ))}
                </div>
              )}

              {item.notes && (
                <p className="pl-6 mt-1 text-xs text-orange-400 italic">
                  "{item.notes}"
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-950 mt-auto">
          <Button 
            className={`w-full font-bold h-12 text-white ${config.color}`}
            onClick={handleNextStatus}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : (
              <>
                {config.icon}
                {config.label}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
