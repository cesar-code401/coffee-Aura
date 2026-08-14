"use client";

import { useState, useEffect } from "react";
import { ProductWithModifiers } from "./ProductCard";
import { useCartStore } from "@/store/useCartStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ModifierModalProps {
  product: ProductWithModifiers | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModifierModal({ product, isOpen, onClose }: ModifierModalProps) {
  const addItem = useCartStore(state => state.addItem);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && product) {
      setSelectedOptions({});
      setNotes("");
      setQuantity(1);
      setValidationErrors({});
      
      // Auto-select required modifiers if there's only one option
      const initial: Record<string, string[]> = {};
      product.modifierGroups.forEach(({ modifierGroup }) => {
        if (modifierGroup.minSelection > 0 && modifierGroup.options.length === 1) {
          initial[modifierGroup.id] = [modifierGroup.options[0].id];
        } else {
          initial[modifierGroup.id] = [];
        }
      });
      setSelectedOptions(initial);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const toggleOption = (groupId: string, optionId: string, maxSelection: number) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      }
      if (current.length >= maxSelection) {
        // Replace oldest or just ignore if max 1
        if (maxSelection === 1) {
          return { ...prev, [groupId]: [optionId] };
        }
        return prev;
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const calculateTotal = () => {
    let total = product.basePrice;
    Object.keys(selectedOptions).forEach(groupId => {
      const group = product.modifierGroups.find(g => g.modifierGroupId === groupId)?.modifierGroup;
      if (group) {
        selectedOptions[groupId].forEach(optId => {
          const opt = group.options.find(o => o.id === optId);
          if (opt) total += opt.priceDelta;
        });
      }
    });
    return total * quantity;
  };

  const handleAddToCart = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    product.modifierGroups.forEach(({ modifierGroup: mg }) => {
      const selectedCount = (selectedOptions[mg.id] || []).length;
      if (selectedCount < mg.minSelection) {
        errors[mg.id] = `Please select at least ${mg.minSelection} option(s)`;
        isValid = false;
      }
    });

    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    const modifiersToAdd = [];
    for (const [groupId, optionIds] of Object.entries(selectedOptions)) {
      const mg = product.modifierGroups.find(g => g.modifierGroupId === groupId)?.modifierGroup;
      for (const optId of optionIds) {
        const opt = mg?.options.find(o => o.id === optId);
        if (mg && opt) {
          modifiersToAdd.push({
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
      quantity,
      notes,
      modifiers: modifiersToAdd
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] h-[90vh] sm:h-auto flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </DialogHeader>

        <ScrollArea className="flex-grow px-6">
          <div className="space-y-6 pb-6 pt-2">
            {product.modifierGroups.map(({ modifierGroup: mg }) => {
              const selected = selectedOptions[mg.id] || [];
              const error = validationErrors[mg.id];
              return (
                <div key={mg.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      {mg.name}
                      {mg.isRequired && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {mg.maxSelection === 1 ? 'Choose 1' : `Choose up to ${mg.maxSelection}`}
                    </span>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="grid grid-cols-1 gap-2">
                    {mg.options.map(opt => {
                      const isSelected = selected.includes(opt.id);
                      const isDisabled = !isSelected && selected.length >= mg.maxSelection;
                      return (
                        <div 
                          key={opt.id} 
                          onClick={() => {
                            if (!isDisabled || mg.maxSelection === 1) {
                              toggleOption(mg.id, opt.id, mg.maxSelection);
                            }
                          }}
                          className={`
                            flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                            ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}
                            ${isDisabled && mg.maxSelection > 1 ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <span className="font-medium">{opt.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {opt.priceDelta > 0 ? `+$${opt.priceDelta.toFixed(2)}` : 'Free'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}

            <div className="space-y-2">
              <Label htmlFor="notes">Special Instructions</Label>
              <Input 
                id="notes" 
                placeholder="e.g. Extra hot, no foam..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setQuantity(quantity + 1)}
              >+</Button>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 sm:p-6 border-t mt-auto">
          <Button onClick={handleAddToCart} className="w-full text-lg h-12">
            Add to Cart - ${calculateTotal().toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
