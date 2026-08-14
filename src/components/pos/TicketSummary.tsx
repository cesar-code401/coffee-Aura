"use client";

import { usePosStore } from "@/store/usePosStore";
import { OrderType } from "@prisma/client";
import { Trash2, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TicketSummaryProps {
  onPayClick: () => void;
  tables: any[];
}

export function TicketSummary({ onPayClick, tables }: TicketSummaryProps) {
  const { 
    items, orderType, tableId, setOrderType, setTableId, customerName, setCustomerInfo,
    updateQuantity, removeItem, getSubtotal, getTotal, getDiscountAmount, discount, setDiscount
  } = usePosStore();

  const handleOrderTypeChange = (val: string) => {
    setOrderType(val as OrderType);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 w-full shadow-lg z-10">
      
      {/* Top Controls: Order Type & Customer/Table */}
      <div className="p-4 border-b space-y-4">
        <Tabs value={orderType} onValueChange={handleOrderTypeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value={OrderType.TAKEOUT}>Takeout</TabsTrigger>
            <TabsTrigger value={OrderType.DINE_IN}>Dine-in</TabsTrigger>
            <TabsTrigger value={OrderType.DELIVERY}>Delivery</TabsTrigger>
          </TabsList>
        </Tabs>

        {orderType === 'DINE_IN' ? (
          <select 
            className="w-full h-10 px-3 rounded-md border border-input bg-transparent"
            value={tableId || ''}
            onChange={(e) => setTableId(e.target.value || null)}
          >
            <option value="">Select Table...</option>
            {tables.map(t => (
              <option key={t.id} value={t.id}>Table {t.number} ({t.zone})</option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Customer Name (Optional)" 
              className="h-8" 
              value={customerName}
              onChange={(e) => setCustomerInfo(e.target.value, '')}
            />
          </div>
        )}
      </div>

      {/* Ticket Items */}
      <ScrollArea className="flex-1 p-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-20">
            <FileText className="h-12 w-12 opacity-20 mb-4" />
            <p>Ticket is empty.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div key={item.uniqueId} className="flex flex-col p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg group">
                <div className="flex justify-between font-semibold">
                  <span>{item.quantity} x {item.name}</span>
                  <span>${((item.basePrice + item.modifiers.reduce((s, m) => s + m.priceDelta, 0)) * item.quantity).toFixed(2)}</span>
                </div>
                {item.modifiers.length > 0 && (
                  <div className="text-xs text-muted-foreground pl-4 mt-1">
                    {item.modifiers.map(m => m.name).join(', ')}
                  </div>
                )}
                {item.notes && <div className="text-xs text-orange-500 pl-4 mt-1 italic">"{item.notes}"</div>}
                
                {/* Quantity Controls - visible on hover or active */}
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}>-</Button>
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}>+</Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto text-destructive" onClick={() => removeItem(item.uniqueId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Totals & Pay Button */}
      <div className="p-4 border-t bg-slate-50 dark:bg-slate-950 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${getSubtotal().toFixed(2)}</span>
        </div>
        
        {/* Simple discount toggle for POS */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground cursor-pointer underline decoration-dotted" onClick={() => setDiscount(discount === 0 ? 10 : 0)}>
            Discount {discount > 0 && `(${discount}%)`}
          </span>
          <span className="text-red-500">
            {discount > 0 ? `-$${getDiscountAmount().toFixed(2)}` : '$0.00'}
          </span>
        </div>

        <div className="flex justify-between text-2xl font-black pt-2 border-t">
          <span>Total</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>

        <Button 
          size="lg" 
          className="w-full h-16 text-xl rounded-xl shadow-md mt-2 bg-green-600 hover:bg-green-700 text-white"
          disabled={items.length === 0}
          onClick={onPayClick}
        >
          Pay & Send Order (F2)
        </Button>
      </div>
    </div>
  );
}
