'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing the current TV/Radio broadcast.
 *
 * - summarizeBroadcast - A function that summarizes the current broadcast.
 * - SummarizeBroadcastInput - The input type for the summarizeBroadcast function.
 * - SummarizeBroadcastOutput - The return type for the summarizeBroadcast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBroadcastInputSchema = z.object({
  broadcastTitle: z.string().describe('The title of the current TV/Radio broadcast.'),
  broadcastDescription: z.string().describe('A detailed description of the current TV/Radio broadcast.'),
});
export type SummarizeBroadcastInput = z.infer<typeof SummarizeBroadcastInputSchema>;

const SummarizeBroadcastOutputSchema = z.object({
  summary: z.string().describe('A short summary of the current TV/Radio broadcast.'),
});
export type SummarizeBroadcastOutput = z.infer<typeof SummarizeBroadcastOutputSchema>;

export async function summarizeBroadcast(input: SummarizeBroadcastInput): Promise<SummarizeBroadcastOutput> {
  return summarizeBroadcastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeBroadcastPrompt',
  input: {schema: SummarizeBroadcastInputSchema},
  output: {schema: SummarizeBroadcastOutputSchema},
  prompt: `You are an expert summarizer. Given the title and description of a TV/Radio broadcast, you will provide a short summary.

Title: {{broadcastTitle}}
Description: {{broadcastDescription}}

Summary:`,
});

const summarizeBroadcastFlow = ai.defineFlow(
  {
    name: 'summarizeBroadcastFlow',
    inputSchema: SummarizeBroadcastInputSchema,
    outputSchema: SummarizeBroadcastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
