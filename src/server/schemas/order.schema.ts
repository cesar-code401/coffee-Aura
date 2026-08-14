import { z } from 'zod';
import { OrderType, PaymentMethod } from '@prisma/client';

export const orderItemModifierSchema = z.object({
  modifierOptionId: z.string().cuid(),
  modifierGroupId: z.string().cuid(),
});

export const orderItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive().min(1),
  notes: z.string().optional().nullable(),
  modifiers: z.array(orderItemModifierSchema).optional().default([]),
});

export const createOrderSchema = z.object({
  type: z.nativeEnum(OrderType),
  tableId: z.string().cuid().optional().nullable(),
  customerName: z.string().min(2, "Name must be at least 2 characters").optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, "Order must contain at least 1 item"),
}).refine((data) => {
  if (data.type === 'DELIVERY' && (!data.customerName || !data.customerPhone)) {
    return false;
  }
  return true;
}, {
  message: "customerName and customerPhone are required for DELIVERY",
  path: ["customerName"],
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
