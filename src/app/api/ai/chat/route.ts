import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import { NextRequest } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages: convertToModelMessages(messages), // Converts UI messages to model format
  });

  // Key change: Use toUIMessageStreamResponse for UI streaming
  return result.toUIMessageStreamResponse();
}