'use server'

import { prisma } from '@/lib/prisma';
import { OrderStatus, OrderItemStatus, Station } from '@prisma/client';

export async function getActiveOrders(station?: Station) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.RECEIVED, OrderStatus.IN_PROGRESS, OrderStatus.READY]
        }
      },
      include: {
        table: true,
        items: {
          include: {
            product: {
              include: { category: true }
            },
            modifiers: {
              include: { modifierOption: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // If a station is specified, filter items by category station
    if (station) {
      return orders.map(order => {
        const filteredItems = order.items.filter(item => item.product.category.station === station);
        return { ...order, items: filteredItems };
      }).filter(order => order.items.length > 0); // Only return orders that have items for this station
    }

    return orders;
  } catch (error) {
    console.error("Failed to fetch active orders:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });
    return { success: true, order };
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderItemStatus(orderItemId: string, newStatus: OrderItemStatus) {
  try {
    const item = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status: newStatus }
    });
    return { success: true, item };
  } catch (error: any) {
    console.error("Failed to update order item status:", error);
    return { success: false, error: error.message };
  }
}
