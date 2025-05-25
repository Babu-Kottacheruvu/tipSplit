// src/ai/flows/order-suggestion.ts
'use server';
/**
 * @fileOverview Helps users determine if their order size is excessive based on past spending habits.
 *
 * - suggestOrderSize - A function that takes past spending data and current bill parameters to suggest if the current order is excessive.
 * - OrderSuggestionInput - The input type for the suggestOrderSize function.
 * - OrderSuggestionOutput - The return type for the suggestOrderSize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrderSuggestionInputSchema = z.object({
  pastSpending: z.array(
    z.object({
      billAmount: z.number().describe('The total bill amount in dollars.'),
      tipPercentage: z.number().describe('The tip percentage applied to the bill.'),
      numberOfPeople: z.number().describe('The number of people splitting the bill.'),
    })
  ).describe('An array of past spending instances with bill amount, tip percentage, and number of people.'),
  currentBillAmount: z.number().describe('The current bill amount in dollars.'),
  currentTipPercentage: z.number().describe('The current tip percentage applied to the bill.'),
  currentNumberOfPeople: z.number().describe('The current number of people splitting the bill.'),
});

export type OrderSuggestionInput = z.infer<typeof OrderSuggestionInputSchema>;

const OrderSuggestionOutputSchema = z.object({
  isExcessive: z.boolean().describe('Whether the current order is likely excessive based on past spending habits.'),
  reasoning: z.string().describe('The reasoning behind the determination of whether the order is excessive.'),
});

export type OrderSuggestionOutput = z.infer<typeof OrderSuggestionOutputSchema>;

export async function suggestOrderSize(input: OrderSuggestionInput): Promise<OrderSuggestionOutput> {
  return suggestOrderSizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'orderSuggestionPrompt',
  input: {schema: OrderSuggestionInputSchema},
  output: {schema: OrderSuggestionOutputSchema},
  prompt: `You are a personal finance advisor helping users determine if their current order size is excessive based on their past spending habits.

  Analyze the user's past spending data and current bill parameters to determine if the current order is likely excessive.
  Consider factors such as the average spending per person, the frequency of dining out, and any significant deviations from past spending patterns.

  Past Spending Data:
  {{#each pastSpending}}
  - Bill Amount: {{{billAmount}}}, Tip Percentage: {{{tipPercentage}}}, Number of People: {{{numberOfPeople}}}
  {{/each}}

  Current Bill Amount: {{{currentBillAmount}}}, Current Tip Percentage: {{{currentTipPercentage}}}, Current Number of People: {{{currentNumberOfPeople}}}

  Based on this information, determine if the current order is likely excessive and provide a brief explanation for your reasoning.

  {{output}}
  `,
});

const suggestOrderSizeFlow = ai.defineFlow(
  {
    name: 'suggestOrderSizeFlow',
    inputSchema: OrderSuggestionInputSchema,
    outputSchema: OrderSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
