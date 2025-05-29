// The directive tells the Next.js runtime that this code should only be executed on the server.
'use server';

/**
 * @fileOverview AI agent that suggests refactorings for a given block of code.
 *
 * - refactorCode - A function that takes code and refactoring instructions and returns refactored code.
 * - RefactorCodeInput - The input type for the refactorCode function.
 * - RefactorCodeOutput - The return type for the refactorCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the refactorCode function
const RefactorCodeInputSchema = z.object({
  code: z.string().describe('The code to refactor.'),
  instructions: z.string().describe('Instructions on how to refactor the code.'),
});
export type RefactorCodeInput = z.infer<typeof RefactorCodeInputSchema>;

// Define the output schema for the refactorCode function
const RefactorCodeOutputSchema = z.object({
  refactoredCode: z.string().describe('The refactored code.'),
  explanation: z.string().describe('An explanation of the changes made.'),
});
export type RefactorCodeOutput = z.infer<typeof RefactorCodeOutputSchema>;

// Exported function to refactor code
export async function refactorCode(input: RefactorCodeInput): Promise<RefactorCodeOutput> {
  return refactorCodeFlow(input);
}

// Define the prompt for refactoring code
const refactorCodePrompt = ai.definePrompt({
  name: 'refactorCodePrompt',
  input: {schema: RefactorCodeInputSchema},
  output: {schema: RefactorCodeOutputSchema},
  prompt: `You are an AI code refactoring assistant. You will receive a block of code and instructions on how to refactor the code.
  Please refactor the code according to the instructions and provide an explanation of the changes you made.

  Code:
  {{code}}

  Instructions:
  {{instructions}}
  `,
});

// Define the Genkit flow for refactoring code
const refactorCodeFlow = ai.defineFlow(
  {
    name: 'refactorCodeFlow',
    inputSchema: RefactorCodeInputSchema,
    outputSchema: RefactorCodeOutputSchema,
  },
  async input => {
    const {output} = await refactorCodePrompt(input);
    return output!;
  }
);
