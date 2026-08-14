"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "@prisma/client";
import { Banknote, CreditCard, QrCode } from "lucide-react";
import { usePosStore } from "@/store/usePosStore";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
}

export function PaymentModal({ isOpen, onClose, onConfirm }: PaymentModalProps) {
  const { getTotal } = usePosStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashGiven, setCashGiven] = useState<string>("");
  
  const total = getTotal();
  const cashNum = parseFloat(cashGiven) || 0;
  const change = cashNum - total;

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(null);
      setCashGiven("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedMethod) return;
    if (selectedMethod === PaymentMethod.CASH && cashNum < total) {
      alert("Insufficient cash provided.");
      return;
    }
    onConfirm(selectedMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Payment: ${total.toFixed(2)}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 my-6">
          <Button 
            variant={selectedMethod === PaymentMethod.CASH ? "default" : "outline"}
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => setSelectedMethod(PaymentMethod.CASH)}
          >
            <Banknote className="h-8 w-8" />
            <span className="font-semibold">Cash</span>
          </Button>
          <Button 
            variant={selectedMethod === PaymentMethod.CARD ? "default" : "outline"}
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => setSelectedMethod(PaymentMethod.CARD)}
          >
            <CreditCard className="h-8 w-8" />
            <span className="font-semibold">Card</span>
          </Button>
          <Button 
            variant={selectedMethod === PaymentMethod.QR_TRANSFER ? "default" : "outline"}
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => setSelectedMethod(PaymentMethod.QR_TRANSFER)}
          >
            <QrCode className="h-8 w-8" />
            <span className="font-semibold">QR</span>
          </Button>
        </div>

        {selectedMethod === PaymentMethod.CASH && (
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-1 block">Cash Received</label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  className="text-xl" 
                  value={cashGiven} 
                  onChange={e => setCashGiven(e.target.value)} 
                  placeholder="0.00"
                  autoFocus
                />
                <Button variant="outline" onClick={() => setCashGiven(total.toString())}>Exact</Button>
              </div>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-muted-foreground">Change Due:</span>
              <span className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                ${change >= 0 ? change.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        )}

        {selectedMethod === PaymentMethod.QR_TRANSFER && (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <QrCode className="h-16 w-16 opacity-50" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Scan with local banking app</p>
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <Button variant="ghost" className="w-full" onClick={onClose}>Cancel (ESC)</Button>
          <Button 
            size="lg" 
            className="w-full" 
            disabled={!selectedMethod || (selectedMethod === PaymentMethod.CASH && cashNum < total)}
            onClick={handleConfirm}
          >
            Complete Order (ENTER)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
