'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing content recommendations based on user viewing history.
 *
 * - contentRecommendationsBasedOnHistory - A function that generates content recommendations based on viewing history.
 * - ContentRecommendationsBasedOnHistoryInput - The input type for the contentRecommendationsBasedOnHistory function.
 * - ContentRecommendationsBasedOnHistoryOutput - The return type for the contentRecommendationsBasedOnHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentRecommendationsBasedOnHistoryInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('An array of show or podcast titles the user has previously viewed.'),
  interests: z
    .array(z.string())
    .optional()
    .describe('An array of user specified interests, which can be used to influence recommendations.'),
  numRecommendations: z
    .number()
    .default(5)
    .describe('The number of content recommendations to generate.'),
});
export type ContentRecommendationsBasedOnHistoryInput = z.infer<
  typeof ContentRecommendationsBasedOnHistoryInputSchema
>;

const ContentRecommendationsBasedOnHistoryOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of recommended show or podcast titles.'),
});
export type ContentRecommendationsBasedOnHistoryOutput = z.infer<
  typeof ContentRecommendationsBasedOnHistoryOutputSchema
>;

export async function contentRecommendationsBasedOnHistory(
  input: ContentRecommendationsBasedOnHistoryInput
): Promise<ContentRecommendationsBasedOnHistoryOutput> {
  return contentRecommendationsBasedOnHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentRecommendationsBasedOnHistoryPrompt',
  input: {schema: ContentRecommendationsBasedOnHistoryInputSchema},
  output: {schema: ContentRecommendationsBasedOnHistoryOutputSchema},
  prompt: `You are a content recommendation expert. Given a user's viewing history and interests,
you will provide a list of content recommendations.

Viewing History: {{#each viewingHistory}}{{{this}}}, {{/each}}

{{#if interests}}
Interests: {{#each interests}}{{{this}}}, {{/each}}
{{/if}}

Please provide {{numRecommendations}} content recommendations based on the viewing history and interests above.
Recommendations:`,
});

const contentRecommendationsBasedOnHistoryFlow = ai.defineFlow(
  {
    name: 'contentRecommendationsBasedOnHistoryFlow',
    inputSchema: ContentRecommendationsBasedOnHistoryInputSchema,
    outputSchema: ContentRecommendationsBasedOnHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
); 
