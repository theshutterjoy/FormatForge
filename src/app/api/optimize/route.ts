import { optimizeCompressionSettingsFlow, OptimizeCompressionSettingsInputSchema } from '@/ai/flows/optimize-compression-settings';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedBody = OptimizeCompressionSettingsInputSchema.parse(body);
    const result = await optimizeCompressionSettingsFlow(validatedBody);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
