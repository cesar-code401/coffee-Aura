'use server'

import { prisma } from '@/lib/prisma';
import { 
  createReservationSchema, CreateReservationInput,
  getAvailableTablesSchema, GetAvailableTablesInput 
} from '../schemas/reservation.schema';
import { ReservationStatus } from '@prisma/client';

const RESERVATION_DURATION_MS = 90 * 60 * 1000; // 90 minutes

export async function createReservation(input: CreateReservationInput) {
  try {
    const data = createReservationSchema.parse(input);
    
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + RESERVATION_DURATION_MS);

    // Transactional Overbooking check
    const reservation = await prisma.$transaction(async (tx) => {
      // 1. Verify if the table has enough capacity and is active
      const table = await tx.table.findUnique({
        where: { id: data.tableId }
      });

      if (!table) throw new Error("Table not found");
      if (!table.isActive) throw new Error("Table is not currently active");
      if (table.capacity < data.partySize) {
        throw new Error(`Table capacity (${table.capacity}) is less than party size (${data.partySize})`);
      }

      // 2. Check for overlapping reservations
      const overlapping = await tx.reservation.findFirst({
        where: {
          tableId: data.tableId,
          status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.SEATED] },
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } }
          ]
        }
      });

      if (overlapping) {
        throw new Error("The table is already reserved during this time slot.");
      }

      // 3. Create the reservation
      return await tx.reservation.create({
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          tableId: data.tableId,
          startTime,
          endTime,
          partySize: data.partySize,
          status: ReservationStatus.CONFIRMED, // Auto-confirm for this implementation
        }
      });
    });

    return { success: true, reservation };
  } catch (error: any) {
    console.error("Reservation creation failed:", error);
    return { success: false, error: error.message || "Failed to create reservation" };
  }
}

export async function getAvailableTables(input: GetAvailableTablesInput) {
  try {
    const data = getAvailableTablesSchema.parse(input);
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + RESERVATION_DURATION_MS);

    // Get all active tables that can fit the party
    const allValidTables = await prisma.table.findMany({
      where: {
        isActive: true,
        capacity: { gte: data.partySize }
      }
    });

    // Get tables that have overlapping reservations
    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.SEATED] },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      },
      select: { tableId: true }
    });

    const reservedTableIds = new Set(overlappingReservations.map(r => r.tableId));

    // Filter out reserved tables
    const availableTables = allValidTables.filter(t => !reservedTableIds.has(t.id));

    return { success: true, tables: availableTables };
  } catch (error: any) {
    console.error("Failed to fetch available tables:", error);
    return { success: false, error: error.message || "Failed to fetch tables" };
  }
}
