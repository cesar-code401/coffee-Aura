"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReservationSchema, CreateReservationInput } from "@/server/schemas/reservation.schema";
import { createReservation, getAvailableTables } from "@/server/actions/reservation.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function ReservationsPage() {
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      tableId: "",
      partySize: 2,
      startTime: new Date(new Date().getTime() + 60 * 60 * 1000) // 1 hour from now
    }
  });

  const checkAvailability = async () => {
    const partySize = form.getValues("partySize");
    const startTimeStr = form.getValues("startTime");
    
    if (!partySize || !startTimeStr) return;
    
    setIsLoading(true);
    try {
      const res = await getAvailableTables({ 
        partySize, 
        startTime: new Date(startTimeStr) 
      });
      if (res.success) {
        setAvailableTables(res.tables || []);
        setHasChecked(true);
        form.setValue("tableId", ""); // Reset selection
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateReservationInput) => {
    setIsLoading(true);
    try {
      const res = await createReservation(data);
      if (res.success) {
        toast({ title: "Reservation Confirmed!", description: "We've saved your table." });
        form.reset();
        setHasChecked(false);
        setAvailableTables([]);
      } else {
        toast({ title: "Booking Failed", description: res.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Book a Table</h1>
          <p className="text-muted-foreground mt-2">Reserve your spot at COFFEE OS.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>Select time and party size to see available tables.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                            value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value} 
                            onChange={(e) => {
                              field.onChange(new Date(e.target.value));
                              setHasChecked(false);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Party Size</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            {...field} 
                            onChange={e => {
                              field.onChange(parseInt(e.target.value));
                              setHasChecked(false);
                            }} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!hasChecked ? (
                  <Button type="button" onClick={checkAvailability} className="w-full" disabled={isLoading}>
                    {isLoading ? "Checking..." : "Check Availability"}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-3">
                      <FormLabel>Available Tables</FormLabel>
                      {availableTables.length === 0 ? (
                        <p className="text-sm text-destructive">No tables available for this time/size.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {availableTables.map(t => (
                            <div 
                              key={t.id}
                              onClick={() => form.setValue("tableId", t.id)}
                              className={`
                                p-4 border rounded-xl text-center cursor-pointer transition-colors
                                ${form.watch("tableId") === t.id ? 'border-primary bg-primary/10' : 'hover:border-primary/50'}
                              `}
                            >
                              <div className="font-semibold">Table {t.number}</div>
                              <div className="text-xs text-muted-foreground">{t.zone}</div>
                              <div className="text-xs text-muted-foreground">Up to {t.capacity} ppl</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {form.formState.errors.tableId && (
                        <p className="text-sm text-destructive">{form.formState.errors.tableId.message}</p>
                      )}
                    </div>

                    {form.watch("tableId") && (
                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-medium">Contact Details</h3>
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl><Input placeholder="+1 555 0000" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email (Optional)</FormLabel>
                              <FormControl><Input type="email" placeholder="john@example.com" {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Confirming..." : "Confirm Reservation"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
