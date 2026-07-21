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

  if (!telegramToken || !telegramChatId) {
    // If not configured, we just skip it gracefully
    return true;
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
      return true; // Return true so it doesn't crash the whole contact form
    }
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return true; // Return true to keep the contact flow running
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
      <title>Incoming Transmission...</title>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&display=swap" rel="stylesheet">
      <style>
        body {
          background-color: #05080e;
          font-family: 'Share Tech Mono', 'Courier New', Courier, monospace;
          margin: 0;
          padding: 0;
          color: #c9d1d9;
        }
        .container {
          max-width: 580px;
          margin: 40px auto;
          background-color: #0a0f1d;
          border: 4px double #00ff66;
          border-radius: 8px;
          padding: 40px 30px;
          text-align: center;
          box-shadow: 0 0 25px rgba(0, 255, 102, 0.15);
        }
        .terminal-header {
          border-bottom: 2px dashed #00ff66;
          padding-bottom: 15px;
          margin-bottom: 25px;
          text-align: left;
        }
        .terminal-title {
          font-family: 'Press Start 2P', 'Courier New', monospace;
          color: #00ff66;
          font-size: 11px;
          margin: 0;
          letter-spacing: 1px;
        }
        .terminal-meta {
          color: #8b949e;
          font-size: 13px;
          margin-top: 5px;
        }
        .gif-main-container {
          margin: 25px 0;
          border: 2px solid #30363d;
          border-radius: 6px;
          background-color: #05080e;
          padding: 10px;
          overflow: hidden;
        }
        .gif-main {
          max-width: 100%;
          height: auto;
          image-rendering: pixelated;
          border-radius: 4px;
        }
        h1 {
          font-family: 'Press Start 2P', 'Courier New', monospace;
          color: #ffffff;
          font-size: 15px;
          line-height: 24px;
          margin: 25px 0 15px 0;
          text-align: left;
          letter-spacing: -0.5px;
        }
        p {
          color: #a3b3c2;
          font-size: 15px;
          line-height: 24px;
          margin: 0 0 20px 0;
          text-align: left;
        }
        .accent {
          color: #00ff66;
          font-weight: bold;
        }
        .button {
          display: inline-block;
          background-color: #00ff66;
          color: #05080e !important;
          font-family: 'Press Start 2P', 'Courier New', monospace;
          text-decoration: none;
          padding: 12px 26px;
          font-weight: bold;
          border-radius: 4px;
          margin: 20px 0;
          font-size: 11px;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0, 255, 102, 0.35);
        }
        .signature-section {
          margin-top: 35px;
          border-top: 2px dashed #21262d;
          padding-top: 25px;
          text-align: left;
        }
        .sig-text {
          font-family: 'Press Start 2P', 'Courier New', monospace;
          font-size: 10px;
          color: #00ff66;
          margin: 0 0 15px 0;
        }
        .pet-container {
          display: inline-block;
          vertical-align: middle;
          margin-right: 12px;
          border: 1px solid #30363d;
          background-color: #05080e;
          padding: 6px;
          border-radius: 6px;
        }
        .pet-gif {
          display: block;
          image-rendering: pixelated;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="terminal-header">
          <div class="terminal-title">&gt; INCOMING_TRANSMISSION...</div>
          <div class="terminal-meta">SYSTEM: sayan.dev // CONSOLE: ACTIVE</div>
        </div>

        <div class="gif-main-container">
          <img src="https://raw.githubusercontent.com/Quantumboy80/sayan-som-portfolio/main/public/assets/mail/retro-computer.gif" width="350" alt="Retro Pixel Computer" class="gif-main" />
        </div>

        <h1>GREETINGS PLAYER 1,</h1>
        <p>Your message has successfully breached the <span class="accent">sayan.dev</span> terminal boundary on <span class="accent">${new Date().toLocaleDateString()}</span>.</p>
        <p>I have stored the incoming telemetry in my main memory buffer. A direct communication sequence will be established within <span class="accent">24 cycles</span> (hours).</p>
        <p>In the meantime, feel free to inspect my project logs, explore my technical write-ups, or return to the main dashboard.</p>
        
        <a href="https://sayan-som-portfolio.vercel.app" class="button" target="_blank">&gt; ENTER_PORTFOLIO</a>

        <div class="signature-section">
          <div class="sig-text">SYSTEM COMPANIONS ACTIVE:</div>
          <div class="pet-container">
            <img src="https://raw.githubusercontent.com/Quantumboy80/sayan-som-portfolio/main/public/assets/mail/kai_zoomies.gif" width="48" height="48" alt="Kai" class="pet-gif" />
          </div>
          <div class="pet-container">
            <img src="https://raw.githubusercontent.com/Quantumboy80/sayan-som-portfolio/main/public/assets/mail/koto_idle.gif" width="48" height="48" alt="Koto" class="pet-gif" />
          </div>
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
