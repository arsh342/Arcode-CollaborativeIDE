'use server';

/**
 * @fileOverview An AI agent to debug code.
 *
 * - debugCode - A function that handles the code debugging process.
 * - DebugCodeInput - The input type for the debugCode function.
 * - DebugCodeOutput - The return type for the debugCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebugCodeInputSchema = z.object({
  code: z.string().describe('The code to debug.'),
  description: z.string().describe('The description of the code.'),
  language: z.string().describe('The programming language of the code.'),
});
export type DebugCodeInput = z.infer<typeof DebugCodeInputSchema>;

const DebugCodeOutputSchema = z.object({
  debuggingSuggestions: z
    .string()
    .describe('Suggestions for debugging the code.'),
  refactoredCode: z.string().describe('The refactored code with fixes.'),
});
export type DebugCodeOutput = z.infer<typeof DebugCodeOutputSchema>;

export async function debugCode(input: DebugCodeInput): Promise<DebugCodeOutput> {
  return debugCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'debugCodePrompt',
  input: {schema: DebugCodeInputSchema},
  output: {schema: DebugCodeOutputSchema},
  prompt: `You are an expert software engineer specializing in debugging code.

You will use the provided information to debug the code and provide debugging suggestions and refactored code.

Description: {{{description}}}
Language: {{{language}}}
Code: {{{code}}} `,
});

const debugCodeFlow = ai.defineFlow(
  {
    name: 'debugCodeFlow',
    inputSchema: DebugCodeInputSchema,
    outputSchema: DebugCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
