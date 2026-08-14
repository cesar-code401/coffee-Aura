"use client";

import { useState } from "react";
import { Station } from "@prisma/client";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { KdsFilterBar } from "@/components/kds/KdsFilterBar";
import { KdsKanban } from "@/components/kds/KdsKanban";

export function KdsClient() {
  const [station, setStation] = useState<Station | 'ALL'>('ALL');
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Custom hook that manages realtime socket and state
  const { orders, loading } = useRealtimeOrders(station === 'ALL' ? undefined : station, audioEnabled);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <KdsFilterBar 
        station={station} 
        setStation={setStation} 
        audioEnabled={audioEnabled} 
        setAudioEnabled={setAudioEnabled} 
      />
      
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <KdsKanban orders={orders} audioEnabled={audioEnabled} />
        )}
      </div>
    </div>
  );
}
