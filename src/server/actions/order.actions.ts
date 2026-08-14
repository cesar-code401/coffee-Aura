'use server'

import { prisma } from '@/lib/prisma';
import { createOrderSchema, CreateOrderInput } from '../schemas/order.schema';

export async function createOrder(input: CreateOrderInput) {
  try {
    const data = createOrderSchema.parse(input);

    // 1. Fetch all related products and modifiers in parallel to verify prices securely
    const productIds = data.items.map(item => item.productId);
    const modifierOptionIds = data.items.flatMap(item => 
      item.modifiers?.map(m => m.modifierOptionId) || []
    );

    const [products, modifierOptions] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { modifierGroups: { include: { modifierGroup: true } } }
      }),
      prisma.modifierOption.findMany({
        where: { id: { in: modifierOptionIds } },
        include: { group: true }
      })
    ]);

    const productMap = new Map(products.map(p => [p.id, p]));
    const modifierMap = new Map(modifierOptions.map(m => [m.id, m]));

    // 2. Validate modifiers (minSelection, maxSelection) and calculate total securely
    let orderTotal = 0;
    
    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (!product.isActive) throw new Error(`Product inactive: ${item.productId}`);

      let itemTotal = product.basePrice;

      // Group requested modifiers by groupId to validate limits
      const requestedModifiersByGroup = new Map<string, number>();
      
      if (item.modifiers) {
        for (const mod of item.modifiers) {
          const modDef = modifierMap.get(mod.modifierOptionId);
          if (!modDef) throw new Error(`Modifier not found: ${mod.modifierOptionId}`);
          if (!modDef.isAvailable) throw new Error(`Modifier unavailable: ${modDef.name}`);

          itemTotal += modDef.priceDelta;
          
          const currentCount = requestedModifiersByGroup.get(modDef.groupId) || 0;
          requestedModifiersByGroup.set(modDef.groupId, currentCount + 1);
        }
      }

      // Validate constraints based on product's modifier groups
      for (const pmg of product.modifierGroups) {
        const mg = pmg.modifierGroup;
        const selectedCount = requestedModifiersByGroup.get(mg.id) || 0;
        
        if (selectedCount < mg.minSelection) {
          throw new Error(`Minimum ${mg.minSelection} selection required for ${mg.name}`);
        }
        if (selectedCount > mg.maxSelection) {
          throw new Error(`Maximum ${mg.maxSelection} selection allowed for ${mg.name}`);
        }
      }

      orderTotal += itemTotal * item.quantity;
    }

    // 3. Obtener el turno activo para asociar el pago si es que aplica
    const activeShift = await prisma.shift.findFirst({ where: { status: 'OPEN' } });

    // 4. Create the order transactionally
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          type: data.type,
          tableId: data.tableId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          paymentMethod: data.paymentMethod,
          total: orderTotal,
          notes: data.notes,
          items: {
            create: data.items.map(item => {
              const product = productMap.get(item.productId)!;
              
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.basePrice,
                notes: item.notes,
                modifiers: {
                  create: item.modifiers?.map(mod => {
                    const modDef = modifierMap.get(mod.modifierOptionId)!;
                    return {
                      modifierOptionId: mod.modifierOptionId,
                      priceDelta: modDef.priceDelta
                    };
                  }) || []
                }
              };
            })
          }
        },
        include: {
          items: {
            include: { modifiers: true }
          }
        }
      });

      if (data.paymentMethod) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            shiftId: activeShift?.id,
            amount: orderTotal,
            method: data.paymentMethod,
            status: 'PAID'
          }
        });
      }

      return order;
    });

    // We would typically emit a realtime event here (e.g. Supabase RPC / Socket.io)
    
    return { success: true, order: newOrder };
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}
