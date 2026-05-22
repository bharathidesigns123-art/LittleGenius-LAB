import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { cookies } from 'next/headers';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('--- GeniusBot API Request ---');
  
  try {
    const body = await req.json();
    const { messages } = body;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('GeniusBot Error: API Key missing in environment.');
      return new Response(JSON.stringify({ error: 'AI Key Missing' }), { status: 500 });
    }

    // Initialize Google provider explicitly
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    let token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('auth_token')?.value;
    }

    // Convert UI messages to model messages (required for SDK v6+)
    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: "You are GeniusBot, the friendly AI assistant for LittleGenius LAB. Answer concisely.",
      messages: modelMessages,
      onError: (error) => {
        console.error('GeniusBot SDK Error Object:', JSON.stringify(error, null, 2));
      },
      tools: {
        getUserOrders: {
          description: "Fetches the logged-in user's recent orders.",
          parameters: z.object({}),
          execute: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5252';
            const response = await fetch(`${apiUrl}/api/store/orders/track/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return JSON.stringify(await response.json());
          },
        },
      },
    });

    return result.toDataStreamResponse();
  } catch (err: any) {
    console.error('GeniusBot Critical Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
