'use server';

/**
 * @fileOverview Adjusts lossless and compression speed settings based on desired file size constraints.
 *
 * - optimizeCompressionSettings - A function that handles the compression settings optimization process.
 * - OptimizeCompressionSettingsInput - The input type for the optimizeCompressionSettings function.
 * - OptimizeCompressionSettingsOutput - The return type for the optimizeCompressionSettings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeCompressionSettingsInputSchema = z.object({
  targetFormat: z
    .enum(['WEBP', 'PNG', 'JPEG', 'AVIF'])
    .describe('The desired output format for the image.'),
  lossless: z
    .boolean()
    .describe(
      'Whether to use lossless compression (true) or lossy compression (false).'
    ),
  compressionSpeed: z
    .number()
    .min(1)
    .max(10)
    .describe(
      'The desired compression speed, where 1 is the slowest and 10 is the fastest.'
    ),
  maxFileSizeKB: z
    .number()
    .min(10)
    .max(10000)
    .describe('The maximum desired file size in kilobytes.'),
});
export type OptimizeCompressionSettingsInput = z.infer<
  typeof OptimizeCompressionSettingsInputSchema
>;

const OptimizeCompressionSettingsOutputSchema = z.object({
  adjustedLossless: z
    .boolean()
    .describe(
      'The adjusted lossless setting based on the file size constraint.'
    ),
  adjustedCompressionSpeed: z
    .number()
    .min(1)
    .max(10)
    .describe(
      'The adjusted compression speed setting based on the file size constraint.'
    ),
  optimizationRationale: z
    .string()
    .describe(
      'Explanation of why and how the settings were adjusted to meet the file size constraints.'
    ),
});
export type OptimizeCompressionSettingsOutput = z.infer<
  typeof OptimizeCompressionSettingsOutputSchema
>;

export async function optimizeCompressionSettings(
  input: OptimizeCompressionSettingsInput
): Promise<OptimizeCompressionSettingsOutput> {
  return optimizeCompressionSettingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeCompressionSettingsPrompt',
  input: {schema: OptimizeCompressionSettingsInputSchema},
  output: {schema: OptimizeCompressionSettingsOutputSchema},
  prompt: `You are an expert image compression optimizer. Given the user's desired image format, lossless setting, compression speed, and maximum file size, you will determine the optimal lossless and compression speed settings to meet the file size constraint while maintaining the best possible image quality.

Here's the information:

Desired Format: {{{targetFormat}}}
Initial Lossless Setting: {{{lossless}}}
Initial Compression Speed: {{{compressionSpeed}}}
Maximum File Size (KB): {{{maxFileSizeKB}}}

Based on this information, provide the adjusted lossless and compression speed settings, along with a clear explanation of your reasoning. If the initial settings are likely to meet the file size constraint, keep them as they are. Otherwise, adjust them strategically, prioritizing image quality as much as possible.

Output the adjusted settings and the rationale in a JSON format.
`,
});

const optimizeCompressionSettingsFlow = ai.defineFlow(
  {
    name: 'optimizeCompressionSettingsFlow',
    inputSchema: OptimizeCompressionSettingsInputSchema,
    outputSchema: OptimizeCompressionSettingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
