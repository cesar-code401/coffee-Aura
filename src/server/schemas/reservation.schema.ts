import { z } from 'zod';

export const createReservationSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(8, "Valid phone number is required"),
  customerEmail: z.string().email("Valid email is required").optional().nullable(),
  tableId: z.string().cuid("Invalid table selection"),
  startTime: z.coerce.date().refine((date) => date > new Date(), {
    message: "Start time must be in the future"
  }),
  partySize: z.number().int().min(1, "Party size must be at least 1"),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const getAvailableTablesSchema = z.object({
  startTime: z.coerce.date().refine((date) => date > new Date(), {
    message: "Start time must be in the future"
  }),
  partySize: z.number().int().min(1, "Party size must be at least 1"),
});

export type GetAvailableTablesInput = z.infer<typeof getAvailableTablesSchema>;
