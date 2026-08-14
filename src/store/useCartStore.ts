import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OrderType } from '@prisma/client';

export interface CartItemModifier {
  modifierOptionId: string;
  modifierGroupId: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  uniqueId: string; // productId + sorted modifierOptionIds
  productId: string;
  name: string;
  basePrice: number;
  quantity: number;
  notes?: string;
  modifiers: CartItemModifier[];
}

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableId: string | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'uniqueId'>) => void;
  removeItem: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setTableId: (id: string | null) => void;
  
  // Computed
  getSubtotal: () => number;
  getTotalItems: () => number;
}

const generateUniqueId = (productId: string, modifiers: CartItemModifier[], notes?: string) => {
  const modIds = modifiers.map(m => m.modifierOptionId).sort().join('-');
  return `${productId}-${modIds}-${notes || ''}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: OrderType.DINE_IN,
      tableId: null,

      addItem: (item) => set((state) => {
        const uniqueId = generateUniqueId(item.productId, item.modifiers, item.notes);
        const existingItem = state.items.find(i => i.uniqueId === uniqueId);

        if (existingItem) {
          return {
            items: state.items.map(i => 
              i.uniqueId === uniqueId 
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          };
        }

        return {
          items: [...state.items, { ...item, uniqueId }]
        };
      }),

      removeItem: (uniqueId) => set((state) => ({
        items: state.items.filter(i => i.uniqueId !== uniqueId)
      })),

      updateQuantity: (uniqueId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(i => i.uniqueId !== uniqueId) };
        }
        return {
          items: state.items.map(i => 
            i.uniqueId === uniqueId ? { ...i, quantity } : i
          )
        };
      }),

      clearCart: () => set({ items: [] }),

      setOrderType: (type) => set({ orderType: type }),
      
      setTableId: (id) => set({ tableId: id }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const itemPrice = item.basePrice + item.modifiers.reduce((sum, mod) => sum + mod.priceDelta, 0);
          return total + (itemPrice * item.quantity);
        }, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'coffee-os-cart',
    }
  )
);
