import { systemPrompt } from '@/config/ChatPrompt';
import { createParser } from 'eventsource-parser';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        parts: z.array(z.object({ text: z.string() })),
      }),
    )
    .optional()
    .default([]),
});

function sanitizeInput(input: string): string {
  const injectionPatterns = [
    /ignore previous instructions/gi,
    /system prompt/gi,
    /you are now/gi,
    /act as/gi,
    /pretend to be/gi,
    /ignore all previous/gi,
    /forget everything/gi,
    /new instructions/gi,
    /override/gi,
    /bypass/gi,
    /hack/gi,
    /exploit/gi,
    /inject/gi,
    /prompt injection/gi,
    /system message/gi,
    /role play/gi,
    /character/gi,
    /persona/gi,
    /behave as/gi,
    /respond as/gi,
  ];

  let sanitized = input;

  injectionPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });

  sanitized = sanitized.trim().replace(/\s+/g, ' ');

  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }

  return sanitized;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

function checkRateLimit(clientIP: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  clientData.count++;
  rateLimitStore.set(clientIP, clientData);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - clientData.count,
  };
}

function handleLocalResponse(userMessage: string, rateLimit: { remaining: number }) {
  let replyText = '';
  const msg = userMessage.toLowerCase();

  if (msg.includes('contact') || msg.includes('email') || msg.includes('social') || msg.includes('linkedin') || msg.includes('twitter') || msg.includes('github') || msg.includes('hire') || msg.includes('reach') || msg.includes('call') || msg.includes('message')) {
    replyText = `You can contact me through any of the following channels:\n\n` +
      `- **Email**: [sayansom625@gmail.com](mailto:sayansom625@gmail.com)\n` +
      `- **LinkedIn**: [Sayan Som](https://www.linkedin.com/in/sayan-som-26853928b/)\n` +
      `- **GitHub**: [Quantumboy80](https://github.com/Quantumboy80)\n` +
      `- **X / Twitter**: [@sayansom](https://x.com/sayansom)\n\n` +
      `I look forward to hearing from you!`;
  } else if (msg.includes('technolog') || msg.includes('skill') || msg.includes('stack') || msg.includes('language') || msg.includes('framework')) {
    replyText = `I work with a variety of modern web technologies. My primary stack includes:\n\n` +
      `- **TypeScript** & JavaScript\n` +
      `- **React** (for building interactive user interfaces)\n` +
      `- **Next.js** (for server-side rendering and full-stack web applications)\n` +
      `- **Bun** (as a fast JavaScript runtime and package manager)\n` +
      `- **PostgreSQL** & MongoDB (for databases)\n` +
      `- **Node.js** & Prisma ORM\n\n` +
      `Feel free to check out the **Skills** section on the homepage for more details!`;
  } else if (msg.includes('project') || msg.includes('portfolio') || msg.includes('website') || msg.includes('app') || msg.includes('repo') || msg.includes('built')) {
    replyText = `Here are some of my recent projects:\n\n` +
      `1. **NotesBuddy**: A comprehensive study platform with notes, flashcards, quizzes, AI chatbot, and interactive learning tools ([Live Demo](https://notesbuddy.in))\n` +
      `2. **Appwrite MCP Server**: Model Context Protocol server for seamless Appwrite database operations with 7 powerful tools\n` +
      `3. **GitInsight**: A tool providing interactive insights and analytics for GitHub repositories\n\n` +
      `You can view the full list with live demos in the [Projects](/projects) section of my portfolio!`;
  } else if (msg.includes('experience') || msg.includes('job') || msg.includes('career') || msg.includes('work') || msg.includes('resume') || msg.includes('cv')) {
    replyText = `Here is a summary of my professional journey:\n\n` +
      `- **Founding Frontend Engineer** at **good day :3** (August 2025 - Present), architecting and developing complete frontend infrastructures.\n\n` +
      `For a more detailed view, check out my [Work Experience](/work-experience) page or download my [Resume](/resume)!`;
  } else {
    replyText = `Hello! I'm Sayan's Portfolio Assistant. To enable full conversational AI, please configure a valid \`GEMINI_API_KEY\` environment variable in your \`.env\` file.\n\n` +
      `In the meantime, you can ask me about:\n` +
      `- My **Skills** and technologies\n` +
      `- My recent **Projects**\n` +
      `- How to **Contact** me for work\n` +
      `- My professional **Experience**`;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = replyText.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunkText = words[i] + (i === words.length - 1 ? '' : ' ');
        const sseData = `data: ${JSON.stringify({ text: chunkText })}\n\n`;
        controller.enqueue(encoder.encode(sseData));
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
      controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    },
  });
}

export async function POST(request: NextRequest) {
  let clientIP = 'unknown';
  let rateLimit = { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  let validatedData;

  try {
    clientIP = getClientIP(request);
    rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: RATE_LIMIT_WINDOW / 1000,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString(),
          },
        },
      );
    }

    const body = await request.json();
    validatedData = chatSchema.parse(body);
  } catch (error) {
    console.error('Chat API Pre-flight Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured. Falling back to local responder.');
    return handleLocalResponse(validatedData.message, rateLimit);
  }

  try {
    // Prepare the request body for Gemini REST API
    const requestBody = {
      contents: [
        {
          parts: [{ text: systemPrompt }],
          role: 'user',
        },
        {
          parts: [
            { text: 'I understand. I will act as your portfolio assistant.' },
          ],
          role: 'model',
        },
        // Add conversation history
        ...validatedData.history.map((msg) => ({
          ...msg,
          parts: msg.parts.map((part) => ({
            ...part,
            text: msg.role === 'user' ? sanitizeInput(part.text) : part.text,
          })),
        })),
        // Add current message
        {
          parts: [{ text: sanitizeInput(validatedData.message) }],
          role: 'user',
        },
      ],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.warn(`Gemini API returned error status ${response.status}. Falling back to local responder.`);
      return handleLocalResponse(validatedData.message, rateLimit);
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const parser = createParser({
            onEvent: (event) => {
              try {
                const data = JSON.parse(event.data);
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  // Send as Server-Sent Event format
                  const sseData = `data: ${JSON.stringify({ text })}\n\n`;
                  controller.enqueue(encoder.encode(sseData));
                }
              } catch (parseError) {
                console.error('Parse error:', parseError);
              }
            },
          });

          if (!response.body) {
            throw new Error('No response body');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            parser.feed(decoder.decode(value));
          }

          // Send completion signal
          controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = `data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });
  } catch (geminiError) {
    console.warn('Gemini API call failed. Falling back to local responder:', geminiError);
    return handleLocalResponse(validatedData.message, rateLimit);
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
