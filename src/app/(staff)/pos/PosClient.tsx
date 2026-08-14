"use client";

import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { TicketSummary } from "@/components/pos/TicketSummary";
import { PosModifierModal } from "@/components/pos/PosModifierModal";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { TicketReceipt } from "@/components/pos/TicketReceipt";
import { ShiftHeader } from "@/components/pos/ShiftHeader";
import { createOrder } from "@/server/actions/order.actions";
import { usePosStore } from "@/store/usePosStore";
import { toast } from "@/hooks/use-toast";
import { PaymentMethod } from "@prisma/client";

interface PosClientProps {
  categories: any[];
  tables: any[];
}

export function PosClient({ categories, tables }: PosClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  const [isModifierOpen, setIsModifierOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  
  const [lastOrder, setLastOrder] = useState<any | null>(null);

  const { items, orderType, tableId, customerName, customerPhone, resetTicket } = usePosStore();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 for Payment
      if (e.key === "F2") {
        e.preventDefault();
        if (items.length > 0 && !isPaymentOpen && !isReceiptOpen && !isModifierOpen) {
          setIsPaymentOpen(true);
        }
      }
      // F3 to focus search
      if (e.key === "F3" || (e.ctrlKey && e.key === "f")) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length, isPaymentOpen, isReceiptOpen, isModifierOpen]);

  const handleProductClick = (product: any) => {
    // If product has modifiers, open modal. Otherwise, add directly.
    const hasRequiredModifiers = product.modifierGroups.some((g: any) => g.modifierGroup.isRequired);
    const hasAnyModifiers = product.modifierGroups.length > 0;
    
    if (hasAnyModifiers) {
      setSelectedProduct(product);
      setIsModifierOpen(true);
    } else {
      usePosStore.getState().addItem({
        productId: product.id,
        name: product.name,
        basePrice: product.basePrice,
        quantity: 1,
        modifiers: []
      });
    }
  };

  const handlePaymentConfirm = async (method: PaymentMethod) => {
    setIsPaymentOpen(false);
    
    const res = await createOrder({
      type: orderType,
      tableId: tableId,
      customerName,
      customerPhone,
      paymentMethod: method,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        notes: i.notes,
        modifiers: i.modifiers.map(m => ({
          modifierGroupId: m.modifierGroupId,
          modifierOptionId: m.modifierOptionId
        }))
      }))
    });

    if (res.success) {
      setLastOrder(res.order);
      setIsReceiptOpen(true);
      resetTicket();
      toast({ title: "Order Success", description: `Order #${res.order.orderNumber} sent to KDS.` });
    } else {
      toast({ title: "Order Failed", description: res.error, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
      <ShiftHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Left side: Grid (65%) */}
        <div className="w-[65%] h-full flex flex-col">
          <ProductGrid 
            categories={categories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onProductClick={handleProductClick}
          />
        </div>

        {/* Right side: Summary (35%) */}
        <div className="w-[35%] h-full flex flex-col border-l border-slate-200 dark:border-slate-800 shadow-xl">
          <TicketSummary 
            tables={tables}
            onPayClick={() => setIsPaymentOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <PosModifierModal 
        product={selectedProduct}
        isOpen={isModifierOpen}
        onClose={() => setIsModifierOpen(false)}
      />

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onConfirm={handlePaymentConfirm}
      />

      <TicketReceipt 
        order={lastOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
}
