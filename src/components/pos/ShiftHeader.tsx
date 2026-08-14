"use client";

import { useState, useEffect } from "react";
import { openShift, closeShift, getActiveShift } from "@/server/actions/shift.actions";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export function ShiftHeader() {
  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isCloseModal, setIsCloseModal] = useState(false);
  
  const [cash, setCash] = useState("");
  const [user, setUser] = useState("Cajero 1");

  useEffect(() => {
    loadShift();
  }, []);

  const loadShift = async () => {
    setLoading(true);
    const res = await getActiveShift();
    if (res.success && res.shift) {
      setShift(res.shift);
    } else {
      setShift(null);
    }
    setLoading(false);
  };

  const handleOpen = async () => {
    const res = await openShift(user, parseFloat(cash) || 0);
    if (res.success) {
      toast({ title: "Caja Abierta" });
      setIsOpenModal(false);
      setCash("");
      loadShift();
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  const handleClose = async () => {
    if (!shift) return;
    const res = await closeShift(shift.id, user, parseFloat(cash) || 0);
    if (res.success) {
      toast({ title: "Caja Cerrada", description: `Diferencia: $${res.difference}` });
      setIsCloseModal(false);
      setCash("");
      loadShift();
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  if (loading) return <div className="h-14 bg-white dark:bg-slate-950 border-b flex items-center px-4 animate-pulse" />;

  return (
    <>
      <div className="h-14 bg-white dark:bg-slate-950 border-b px-6 flex items-center justify-between shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="font-serif font-bold text-xl tracking-tight text-stone-900 dark:text-white">Aura POS</div>
          <div className="h-4 w-px bg-stone-200 dark:bg-stone-800" />
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {new Date().toLocaleDateString()}
          </div>
        </div>

        <div>
          {shift ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
                <Unlock className="h-3 w-3" /> Turno Abierto por {shift.openedBy}
              </div>
              <Button variant="outline" size="sm" className="h-8 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setIsCloseModal(true)}>
                Cerrar Caja
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold border border-red-200 shadow-sm">
                <Lock className="h-3 w-3" /> Caja Cerrada
              </div>
              <Button size="sm" className="h-8 rounded-full bg-stone-900 hover:bg-amber-700 transition-colors" onClick={() => setIsOpenModal(true)}>
                Abrir Turno
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Open Shift */}
      <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Abrir Turno de Caja</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-bold text-stone-700 mb-1 block">Nombre del Cajero</label>
              <Input value={user} onChange={e => setUser(e.target.value)} className="bg-stone-50" />
            </div>
            <div>
              <label className="text-sm font-bold text-stone-700 mb-1 block">Efectivo Inicial en Gaveta</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                <Input type="number" placeholder="0.00" value={cash} onChange={e => setCash(e.target.value)} className="pl-7 bg-stone-50" />
              </div>
            </div>
            <Button className="w-full h-12 bg-stone-900 hover:bg-stone-800 rounded-xl" onClick={handleOpen}>Confirmar Apertura</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Close Shift */}
      <Dialog open={isCloseModal} onOpenChange={setIsCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Cierre de Caja (Arqueo)</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-xs font-medium flex items-start gap-2 leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              Ingresa el monto total de billetes y monedas que hay físicamente en la gaveta. El sistema calculará automáticamente el sobrante o faltante según las ventas.
            </div>
            <div>
              <label className="text-sm font-bold text-stone-700 mb-1 block">Efectivo Final Físico</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                <Input type="number" placeholder="0.00" value={cash} onChange={e => setCash(e.target.value)} className="pl-7 bg-stone-50 text-lg font-bold" />
              </div>
            </div>
            <Button className="w-full h-12 bg-red-600 hover:bg-red-700 rounded-xl" onClick={handleClose}>Cerrar y Emitir Reporte</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
