import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getActiveOrders } from '@/server/actions/kds.actions';
import { Station } from '@prisma/client';
import { playAudioAlert } from '@/lib/sound';

export function useRealtimeOrders(station?: Station, audioEnabled: boolean = true) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const data = await getActiveOrders(station);
    setOrders(data);
    setLoading(false);
  }, [station]);

  useEffect(() => {
    fetchOrders();

    // Supabase Postgres Changes Subscription
    const channel = supabase
      .channel('kds-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Order' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (audioEnabled) playAudioAlert('new');
            // Full re-fetch to easily get relations (items, tables). 
            // In a highly optimized app, you'd fetch just the single order via API.
            fetchOrders(); 
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => {
              const idx = prev.findIndex(o => o.id === payload.new.id);
              if (idx > -1) {
                const updated = [...prev];
                // Only update the base fields, preserving nested relations we already fetched
                updated[idx] = { ...updated[idx], ...payload.new };
                return updated;
              }
              // If it transitioned to an active state from something else, re-fetch
              fetchOrders();
              return prev;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'OrderItem' },
        (payload) => {
          // Re-fetch to keep nested state consistent easily
          fetchOrders();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime KDS connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('Realtime KDS disconnected. Implementing backoff...');
          // Supabase handles exponential backoff internally for reconnections
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, audioEnabled]);

  return { orders, loading, refresh: fetchOrders };
}
