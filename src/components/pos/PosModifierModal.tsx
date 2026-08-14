"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { usePosStore } from "@/store/usePosStore";

interface PosModifierModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PosModifierModal({ product, isOpen, onClose }: PosModifierModalProps) {
  const addItem = usePosStore(state => state.addItem);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  
  useEffect(() => {
    if (isOpen && product) {
      setSelected({});
      setNotes("");
      // Auto select defaults or single required
      const initial: Record<string, string[]> = {};
      product.modifierGroups.forEach((pmg: any) => {
        const mg = pmg.modifierGroup;
        if (mg.minSelection > 0 && mg.options.length === 1) {
          initial[mg.id] = [mg.options[0].id];
        }
      });
      setSelected(initial);
    }
  }, [isOpen, product]);

  // Handle ESC globally or let Dialog handle it
  // Wait, Radix Dialog handles ESC by default.

  if (!product) return null;

  const handleAdd = () => {
    // Basic validation
    for (const pmg of product.modifierGroups) {
      const mg = pmg.modifierGroup;
      const count = (selected[mg.id] || []).length;
      if (count < mg.minSelection) {
        // Enforce required in POS? Usually POS can bypass some rules, but let's be strict or alert
        alert(`Need to select at least ${mg.minSelection} for ${mg.name}`);
        return;
      }
    }

    const modifiers = [];
    for (const [groupId, optionIds] of Object.entries(selected)) {
      const mg = product.modifierGroups.find((g: any) => g.modifierGroupId === groupId)?.modifierGroup;
      for (const optId of optionIds) {
        const opt = mg?.options.find((o: any) => o.id === optId);
        if (mg && opt) {
          modifiers.push({
            modifierGroupId: mg.id,
            modifierOptionId: opt.id,
            name: opt.name,
            priceDelta: opt.priceDelta
          });
        }
      }
    }

    addItem({
      productId: product.id,
      name: product.name,
      basePrice: product.basePrice,
      quantity: 1, // Default 1, can be incremented in ticket
      notes,
      modifiers
    });
    
    onClose();
  };

  const toggleOpt = (mg: any, optId: string) => {
    setSelected(prev => {
      const cur = prev[mg.id] || [];
      if (cur.includes(optId)) {
        return { ...prev, [mg.id]: cur.filter(id => id !== optId) };
      }
      if (cur.length >= mg.maxSelection) {
        if (mg.maxSelection === 1) return { ...prev, [mg.id]: [optId] };
        return prev;
      }
      return { ...prev, [mg.id]: [...cur, optId] };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 border-0 overflow-hidden">
        <DialogHeader className="p-4 bg-slate-900 text-slate-50">
          <DialogTitle className="text-xl">{product.name} Customization</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] p-4">
          <div className="space-y-6">
            {product.modifierGroups.map((pmg: any) => {
              const mg = pmg.modifierGroup;
              const sel = selected[mg.id] || [];
              return (
                <div key={mg.id}>
                  <h4 className="font-bold mb-2 uppercase text-xs tracking-wider text-muted-foreground">
                    {mg.name} {mg.isRequired ? '*' : ''}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {mg.options.map((opt: any) => {
                      const isSel = sel.includes(opt.id);
                      return (
                        <Button
                          key={opt.id}
                          variant={isSel ? "default" : "outline"}
                          className={`h-auto py-3 px-4 justify-between ${isSel ? 'border-primary' : ''}`}
                          onClick={() => toggleOpt(mg, opt.id)}
                        >
                          <span className="font-semibold">{opt.name}</span>
                          <span className="text-xs opacity-70">
                            {opt.priceDelta > 0 ? `+$${opt.priceDelta}` : ''}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            <div>
              <h4 className="font-bold mb-2 uppercase text-xs tracking-wider text-muted-foreground">Notes</h4>
              <Input 
                placeholder="Custom request..." 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-slate-50 dark:bg-slate-950">
          <Button variant="ghost" onClick={onClose}>Cancel (ESC)</Button>
          <Button onClick={handleAdd} size="lg" className="px-8">Add Item (ENTER)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
