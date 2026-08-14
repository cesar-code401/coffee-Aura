'use server'

import { prisma } from '@/lib/prisma';
import { ShiftStatus } from '@prisma/client';

export async function openShift(openedBy: string, startingCash: number) {
  try {
    // Check if there is already an open shift
    const existing = await prisma.shift.findFirst({
      where: { status: 'OPEN' }
    });
    
    if (existing) {
      return { success: false, error: 'There is already an open shift.' };
    }

    const shift = await prisma.shift.create({
      data: {
        openedBy,
        startingCash,
        status: 'OPEN'
      }
    });

    return { success: true, shift };
  } catch (error: any) {
    console.error("Open shift failed:", error);
    return { success: false, error: error.message || "Failed to open shift" };
  }
}

export async function closeShift(shiftId: string, closedBy: string, endingCash: number, notes?: string) {
  try {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { payments: true }
    });
    
    if (!shift) return { success: false, error: 'Shift not found' };
    if (shift.status === 'CLOSED') return { success: false, error: 'Shift already closed' };

    // Calculate expected cash
    const cashPayments = shift.payments.filter(p => p.method === 'CASH' && p.status === 'COMPLETED');
    const cashTotal = cashPayments.reduce((sum, p) => sum + p.amount, 0);
    const expectedCash = shift.startingCash + cashTotal;

    const closed = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy,
        endingCash,
        expectedCash,
        notes
      }
    });

    return { success: true, shift: closed, difference: endingCash - expectedCash };
  } catch (error: any) {
    console.error("Close shift failed:", error);
    return { success: false, error: error.message || "Failed to close shift" };
  }
}

export async function getActiveShift() {
  try {
    const shift = await prisma.shift.findFirst({
      where: { status: 'OPEN' },
      include: {
        payments: true
      }
    });
    return { success: true, shift };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
