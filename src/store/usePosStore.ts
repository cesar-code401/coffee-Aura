import { create } from 'zustand';
import { OrderType, PaymentMethod } from '@prisma/client';

export interface PosItemModifier {
  modifierOptionId: string;
  modifierGroupId: string;
  name: string;
  priceDelta: number;
}

export interface PosItem {
  uniqueId: string;
  productId: string;
  name: string;
  basePrice: number;
  quantity: number;
  notes?: string;
  modifiers: PosItemModifier[];
}

interface PosState {
  items: PosItem[];
  orderType: OrderType;
  tableId: string | null;
  discount: number; // percentage 0-100
  paymentMethod: PaymentMethod | null;
  customerName: string;
  customerPhone: string;
  
  // Actions
  addItem: (item: Omit<PosItem, 'uniqueId'>) => void;
  removeItem: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  setOrderType: (type: OrderType) => void;
  setTableId: (id: string | null) => void;
  setDiscount: (percent: number) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setCustomerInfo: (name: string, phone: string) => void;
  resetTicket: () => void;
  
  // Computed (getters)
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
}

const generateUniqueId = (productId: string, modifiers: PosItemModifier[], notes?: string) => {
  const modIds = modifiers.map(m => m.modifierOptionId).sort().join('-');
  return `${productId}-${modIds}-${notes || ''}`;
};

const TAX_RATE = 0; // Assuming tax is included in base price or 0 for now. Can be adjusted.

export const usePosStore = create<PosState>()((set, get) => ({
  items: [],
  orderType: OrderType.TAKEOUT,
  tableId: null,
  discount: 0,
  paymentMethod: null,
  customerName: '',
  customerPhone: '',

  addItem: (item) => set((state) => {
    const uniqueId = generateUniqueId(item.productId, item.modifiers, item.notes);
    const existingItem = state.items.find(i => i.uniqueId === uniqueId);

    // Audio feedback for POS
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/beep.mp3'); // We'll assume a beep sound exists or just ignore errors
      audio.play().catch(() => {});
    }

    if (existingItem) {
      return {
        items: state.items.map(i => 
          i.uniqueId === uniqueId ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      };
    }
    return { items: [...state.items, { ...item, uniqueId }] };
  }),

  removeItem: (uniqueId) => set((state) => ({
    items: state.items.filter(i => i.uniqueId !== uniqueId)
  })),

  updateQuantity: (uniqueId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(i => i.uniqueId !== uniqueId) };
    }
    return {
      items: state.items.map(i => i.uniqueId === uniqueId ? { ...i, quantity } : i)
    };
  }),

  setOrderType: (type) => set({ orderType: type, tableId: type !== 'DINE_IN' ? null : get().tableId }),
  setTableId: (id) => set({ tableId: id, orderType: id ? OrderType.DINE_IN : get().orderType }),
  setDiscount: (percent) => set({ discount: Math.max(0, Math.min(100, percent)) }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCustomerInfo: (name, phone) => set({ customerName: name, customerPhone: phone }),
  
  resetTicket: () => set({
    items: [],
    orderType: OrderType.TAKEOUT,
    tableId: null,
    discount: 0,
    paymentMethod: null,
    customerName: '',
    customerPhone: ''
  }),

  getSubtotal: () => {
    return get().items.reduce((total, item) => {
      const itemPrice = item.basePrice + item.modifiers.reduce((sum, mod) => sum + mod.priceDelta, 0);
      return total + (itemPrice * item.quantity);
    }, 0);
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    return subtotal * (get().discount / 100);
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    return (subtotal - discount) * TAX_RATE;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const tax = get().getTaxAmount();
    return subtotal - discount + tax;
  }
}));
