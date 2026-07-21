import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import nodemailer from 'nodemailer';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  message: z.string().min(10).max(1000),
});

function getClientIP(request: NextRequest): string {
  // Get IP from various headers in order of preference
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
    // First request or window expired
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  clientData.count++;
  rateLimitStore.set(clientIP, clientData);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - clientData.count,
  };
}

async function sendToTelegram(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<boolean> {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  if (!telegramChatId) {
    console.error('TELEGRAM_CHAT_ID not configured');
    return false;
  }

  const message = `
🔔 *New Contact Form Submission*

👤 *Name:* ${data.name.trim()}
📧 *Email:* ${data.email.trim()}
📱 *Phone:* ${data.phone.trim()}

💬 *Message:*
${data.message.trim()}

⏰ *Submitted:* ${new Date().toISOString()}
📍 *Timezone:* ${Intl.DateTimeFormat().resolvedOptions().timeZone}
  `.trim();

  try {
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      console.error('Failed to send to Telegram:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

async function sendAutoResponseEmail(data: {
  name: string;
  email: string;
}): Promise<boolean> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS; // App Password

  if (!gmailUser || !gmailPass) {
    console.warn('GMAIL_USER or GMAIL_PASS not configured. Skipping welcome email.');
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Visiting!</title>
      <style>
        body {
          background-color: #0b0f19;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #c9d1d9;
        }
        .container {
          max-width: 580px;
          margin: 40px auto;
          background-color: #0d1117;
          border: 1px solid #21262d;
          border-radius: 16px;
          padding: 40px 30px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .logo {
          border-radius: 50%;
          border: 2px solid #ff0000;
          margin-bottom: 20px;
        }
        h1 {
          color: #ffffff;
          font-size: 26px;
          font-weight: 800;
          margin: 10px 0 20px 0;
          letter-spacing: -0.5px;
        }
        p {
          color: #8b949e;
          font-size: 15px;
          line-height: 24px;
          margin: 0 0 20px 0;
          text-align: left;
        }
        .gif-container {
          margin: 25px 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #30363d;
        }
        .gif {
          width: 100%;
          height: auto;
          display: block;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ff0000 0%, #a30000 100%);
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 30px;
          font-weight: 700;
          border-radius: 8px;
          margin: 20px 0;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
          font-size: 15px;
        }
        .footer {
          border-top: 1px solid #21262d;
          padding-top: 25px;
          margin-top: 30px;
          color: #8b949e;
          font-size: 12px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="https://raw.githubusercontent.com/Quantumboy80/sayan-som-portfolio/main/public/assets/luffy_avatar.jpg" width="70" height="70" alt="Sayan Som Logo" class="logo" />
        <h1>Thank You for Reaching Out! ⚡</h1>
        <p>Hi ${data.name.trim()},</p>
        <p>Thanks for visiting my portfolio and submitting a message! I've received your inquiry and will read it shortly. I usually get back to messages within 24 hours.</p>
        
        <div class="gif-container">
          <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnV1azR0bm1tOHRxajF6d28xczM3ODdzc2I5aWN5aDF4dWF3dTFoZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7qE1YN7aBOFPRw8E/giphy.gif" alt="Pixel Art Coding" class="gif" />
        </div>
        
        <p>In the meantime, feel free to explore my latest software engineering projects or read through my technical write-ups on my blog.</p>
        
        <a href="https://sayan-som-portfolio.vercel.app" class="button" target="_blank">Visit Portfolio</a>
        
        <div class="footer">
          Made with ❤️ by Sayan Som • Kolkata, India
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Sayan Som" <${gmailUser}>`,
      to: data.email.trim(),
      subject: `Thank you for reaching out, ${data.name.split(' ')[0]}!`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending auto-response email via Gmail:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

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
    const validatedData = contactSchema.parse(body);

    const telegramSent = await sendToTelegram(validatedData);

    if (!telegramSent) {
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 },
      );
    }

    // Trigger welcome auto-responder email and await execution to prevent Vercel Serverless environment freezing
    await sendAutoResponseEmail(validatedData).catch((err) => {
      console.error('Welcome email failed:', err);
    });

    return NextResponse.json(
      {
        message: 'Message sent successfully!',
        success: true,
      },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      },
    );
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid form data',
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
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
