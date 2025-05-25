"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PastSpendingItem, PastBillEntryFormValues } from "@/lib/types";
import { DollarSign, Percent, Users, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const pastBillSchema = z.object({
  pastBillAmount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Must be a positive number.",
  }),
  pastTipPercentage: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, {
    message: "Must be between 0 and 100.",
  }),
  pastNumberOfPeople: z.string().refine(val => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1;
  }, {
    message: "Must be at least 1.",
  }),
});

interface PastBillEntryFormProps {
  onAddPastBill: (bill: Omit<PastSpendingItem, 'id'>) => void;
}

export function PastBillEntryForm({ onAddPastBill }: PastBillEntryFormProps) {
  const form = useForm<PastBillEntryFormValues>({
    resolver: zodResolver(pastBillSchema),
    defaultValues: {
      pastBillAmount: "",
      pastTipPercentage: "",
      pastNumberOfPeople: "1",
    },
  });

  function onSubmit(values: PastBillEntryFormValues) {
    onAddPastBill({
      billAmount: parseFloat(values.pastBillAmount),
      tipPercentage: parseFloat(values.pastTipPercentage),
      numberOfPeople: parseInt(values.pastNumberOfPeople),
    });
    form.reset();
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Add Past Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pastBillAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Amount</FormLabel>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50.00" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pastTipPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Percentage</FormLabel>
                   <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input type="number" placeholder="e.g., 18" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pastNumberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of People</FormLabel>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Past Bill
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
