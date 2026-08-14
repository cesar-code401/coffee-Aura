"use client";

import { useCartStore } from "@/store/useCartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { createOrder } from "@/server/actions/order.actions";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { OrderType } from "@prisma/client";
import { StripeCheckout } from "./StripeCheckout";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { items, getSubtotal, removeItem, updateQuantity, orderType, setOrderType, tableId, clearCart } = useCartStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [manualTable, setManualTable] = useState("");

  const subtotal = getSubtotal();

  const handleConfirmOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (items.length === 0) return;

    // Validación Básica Front-end
    if (!customerName.trim()) {
      toast({ title: "Atención", description: "Por favor ingresa tu nombre.", variant: "destructive" });
      return;
    }
    if ((orderType === OrderType.TAKEOUT || orderType === OrderType.DELIVERY) && !customerPhone.trim()) {
      toast({ title: "Atención", description: "El teléfono/WhatsApp es obligatorio para este tipo de pedido.", variant: "destructive" });
      return;
    }

    setIsPaying(true);
  };

  const handlePaymentSuccess = async (stripeSessionId: string) => {
    try {
      setIsSubmitting(true);
      
      // Si eligieron Mesa pero no hay tableId por QR, adjuntamos la mesa manual a las notas
      let finalNotes = notes.trim();
      if (orderType === OrderType.DINE_IN && !tableId && manualTable.trim()) {
        finalNotes = finalNotes ? `Mesa Manual: ${manualTable} | ${finalNotes}` : `Mesa Manual: ${manualTable}`;
      }

      console.log("Enviando orden:", { items, orderType, customerName, customerPhone, tableId, notes: finalNotes });
      
      const res = await createOrder({
        type: orderType,
        tableId: orderType === OrderType.DINE_IN && tableId ? tableId : null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        notes: finalNotes || null,
        paymentMethod: 'CARD', // Ya pagó por Stripe
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          notes: i.notes || null,
          modifiers: i.modifiers.map(m => ({
            modifierGroupId: m.modifierGroupId,
            modifierOptionId: m.modifierOptionId
          }))
        }))
      });

      if (res.success && res.order) {
        clearCart();
        setIsPaying(false);
        onClose();
        toast({
          title: "¡Pedido Confirmado!",
          description: `Orden #${res.order.orderNumber} enviada a cocina.`,
        });
      } else {
        toast({
          title: "Error al crear la orden",
          description: res.error || "Revisa los datos e intenta de nuevo.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error inesperado en checkout:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar el pedido.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-2 border-b">
          <SheetTitle>Tu Carrito</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-grow p-6">
          {isPaying ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setIsPaying(false)}>← Volver</Button>
                <h3 className="font-semibold text-lg">Pago Seguro</h3>
              </div>
              <StripeCheckout amount={subtotal} onSuccess={handlePaymentSuccess} />
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-12">
              <p>Tu carrito está vacío.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Items List */}
              <div className="space-y-6">
                {items.map(item => (
                  <div key={item.uniqueId} className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <h4 className="font-semibold">{item.name}</h4>
                        <span className="font-medium">
                          ${((item.basePrice + item.modifiers.reduce((s, m) => s + m.priceDelta, 0)) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {item.modifiers.length > 0 && (
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {item.modifiers.map(m => (
                            <li key={m.modifierOptionId}>
                              {m.name} {m.priceDelta > 0 && `(+$${m.priceDelta.toFixed(2)})`}
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.notes && <p className="text-sm italic text-muted-foreground">"{item.notes}"</p>}
                      
                      <div className="flex items-center gap-3 pt-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}>-</Button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}>+</Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-auto text-destructive" onClick={() => removeItem(item.uniqueId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleConfirmOrder} className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Detalles del Pedido</h3>
                
                <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value={OrderType.DINE_IN}>Mesa</TabsTrigger>
                    <TabsTrigger value={OrderType.TAKEOUT}>Para Llevar</TabsTrigger>
                    <TabsTrigger value={OrderType.DELIVERY}>A Domicilio</TabsTrigger>
                  </TabsList>
                </Tabs>

                {orderType === OrderType.DINE_IN && (
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                    <Label className="text-muted-foreground">Asignación de Mesa</Label>
                    {tableId ? (
                      <p className="font-bold text-sm text-green-600 dark:text-green-400">Mesa Detectada por QR</p>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <Label>¿En qué mesa estás? (Opcional)</Label>
                        <Input 
                          placeholder="Ej. Mesa 8" 
                          value={manualTable}
                          onChange={(e) => setManualTable(e.target.value)}
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground">Si no lo sabes, puedes pedir y luego avisar al personal.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Nombre <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Ej. Carlos" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {(orderType === OrderType.TAKEOUT || orderType === OrderType.DELIVERY) && (
                  <div className="space-y-2">
                    <Label>Teléfono / WhatsApp <span className="text-red-500">*</span></Label>
                    <Input 
                      type="tel"
                      placeholder="Ej. 555-1234" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notas del Pedido (Opcional)</Label>
                  <Input 
                    placeholder="Indicaciones adicionales..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </form>
            </div>
          )}
        </ScrollArea>

        {!isPaying && (
          <SheetFooter className="p-6 border-t mt-auto flex-col gap-4 sm:flex-col">
            <div className="flex justify-between w-full text-lg font-bold">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Button 
              type="submit"
              className="w-full h-12 text-lg font-bold bg-stone-900 hover:bg-stone-800" 
              disabled={items.length === 0 || customerName.trim() === '' || isSubmitting}
              onClick={handleConfirmOrder}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Enviando...
                </span>
              ) : "Pagar y Confirmar"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
