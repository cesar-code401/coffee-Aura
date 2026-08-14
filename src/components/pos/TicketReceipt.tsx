"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { approvePayment } from "@/server/actions/payment.actions";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface TicketReceiptProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TicketReceipt({ order, isOpen, onClose }: TicketReceiptProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);

  if (!order) return null;

  const isQrTransfer = order.paymentMethod === 'QR_TRANSFER';
  const hasPendingPayment = order.payments?.some((p: any) => p.status === 'PENDING') && !paymentApproved;

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = async () => {
    setIsApproving(true);
    const res = await approvePayment(order.id);
    if (res.success) {
      toast({ title: "Pago Aprobado", description: "El pago fue verificado. Emitiendo factura..." });
      setPaymentApproved(true);
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setIsApproving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Receipt</DialogTitle>
        </DialogHeader>
        
        {/* Printable Area */}
        <div className="bg-white p-6 font-mono text-sm text-black" id="printable-receipt">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">COFFEE OS</h2>
            <p>123 Coffee Street</p>
            <p>Receipt #{order.orderNumber}</p>
            <p>{new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <div className="mb-4">
            <p>Type: {order.type}</p>
            {order.table && <p>Table: {order.table.number}</p>}
            {order.customerName && <p>Customer: {order.customerName}</p>}
          </div>

          <div className="border-t border-b border-dashed border-gray-400 py-4 mb-4 space-y-2">
            {order.items.map((item: any) => (
              <div key={item.id}>
                <div className="flex justify-between font-bold">
                  <span>{item.quantity}x {item.product?.name || 'Item'}</span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
                {item.modifiers?.map((m: any) => (
                  <div key={m.id} className="flex justify-between text-xs text-gray-600 pl-4">
                    <span>- {m.modifierOption?.name}</span>
                    {m.priceDelta > 0 && <span>${m.priceDelta.toFixed(2)}</span>}
                  </div>
                ))}
                {item.notes && <p className="text-xs italic pl-4 text-gray-600">"{item.notes}"</p>}
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          
          <div className="text-center mt-6 pt-4 border-t border-gray-400">
            <p>Thank you for your visit!</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4 no-print">
          {isQrTransfer && hasPendingPayment && (
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 font-bold h-12 text-white animate-pulse" 
              onClick={handleApprove}
              disabled={isApproving}
            >
              {isApproving ? "Verificando..." : "⚠️ APROBAR PAGO QR RECIBIDO"}
            </Button>
          )}
          <div className="flex gap-4">
            <Button variant="outline" className="w-full h-12" onClick={onClose}>Nueva Orden</Button>
            <Button className="w-full h-12" onClick={handlePrint}>Imprimir Ticket</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
