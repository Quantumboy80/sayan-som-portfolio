import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import nodemailer from 'nodemailer';
import path from 'path';
import { siteConfig } from '@/config/Meta';

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

async function sendAutoResponseEmail(
  data: { name: string; email: string },
  baseUrl: string
): Promise<boolean> {
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
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
      <style>
        body {
          background-color: #e5ecf6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 40px 10px;
          color: #000000;
        }
        .container {
          max-width: 540px;
          margin: 0 auto;
          background-color: #fcfaf2;
          border: 2px solid #000000;
          border-radius: 8px;
          padding: 40px 30px;
          text-align: center;
        }
        .header-logo {
          font-family: 'Press Start 2P', 'Courier New', monospace;
          font-size: 13px;
          font-weight: bold;
          color: #000000;
          margin-bottom: 25px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .gif-banner-container {
          margin: 20px 0 30px 0;
          border: 2px solid #000000;
          border-radius: 8px;
          overflow: hidden;
          line-height: 0;
          background-color: #000000;
        }
        .gif-banner {
          width: 100%;
          height: auto;
          display: block;
          image-rendering: pixelated;
        }
        h1 {
          font-family: system-ui, -apple-system, sans-serif;
          color: #000000;
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 5px 0;
          text-align: left;
          letter-spacing: -0.5px;
        }
        .meta-status {
          font-family: 'Press Start 2P', 'Courier New', monospace;
          color: #ff5500;
          font-size: 9px;
          font-weight: bold;
          letter-spacing: 0.5px;
          text-align: left;
          margin: 0 0 25px 0;
          text-transform: uppercase;
        }
        p {
          color: #000000;
          font-size: 15px;
          line-height: 24px;
          margin: 0 0 20px 0;
          text-align: left;
        }
        .accent {
          font-weight: bold;
          border-bottom: 2px solid #000000;
        }
        .button-container {
          margin: 35px 0;
          text-align: center;
        }
        .button {
          display: inline-block;
          background-color: #f3c623;
          color: #000000 !important;
          font-family: 'Press Start 2P', 'Courier New', monospace;
          text-decoration: none;
          padding: 14px 32px;
          font-weight: bold;
          font-size: 11px;
          border: 2px solid #000000;
          border-radius: 6px;
          box-shadow: inset -4px -4px 0px 0px #d89f0e, 0px 4px 0px 0px #000000;
        }
        .divider {
          border-top: 2px solid #000000;
          margin: 40px 0 30px 0;
        }
        .social-container {
          margin: 25px 0;
          text-align: center;
        }
        .social-icon {
          display: inline-block;
          width: 32px;
          height: 32px;
          line-height: 32px;
          border-radius: 50%;
          background-color: #000000;
          color: #ffffff !important;
          text-decoration: none;
          font-size: 13px;
          font-weight: bold;
          margin: 0 8px;
          text-align: center;
        }
        .footer-pet-section {
          margin: 25px 0;
          display: inline-flex;
          justify-content: center;
          gap: 15px;
        }
        .pet-card {
          border: 2px solid #000000;
          background-color: #ffffff;
          padding: 5px;
          border-radius: 6px;
        }
        .pet-gif {
          display: block;
          image-rendering: pixelated;
        }
        .footer-text {
          font-size: 12px;
          line-height: 18px;
          color: #555555;
          margin-top: 25px;
        }
        .footer-link {
          color: #0000ee;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header-logo">
          <span>🪙</span> sayan.dev
        </div>

        <div class="gif-banner-container">
          <img src="https://sayan-som-portfolio.vercel.app/assets/mail/top-banner.gif" alt="Top Banner Pixel GIF" class="gif-banner" />
        </div>

        <h1>Transmission Logged ⚡</h1>
        <div class="meta-status">STATUS: BUFFER QUEUE RUNNING // PORT: 8080</div>
        
        <p>Got a project, feedback, or a question for me?</p>
        
        <p>Your incoming message successfully breached the <span class="accent">sayan.dev</span> terminal core on ${new Date().toLocaleDateString()}.</p>
        
        <p>I have registered your transmission details in my main buffer array. An active response channel will be established in approximately <span class="accent">24 cycles</span> (hours).</p>
        
        <p>In the meantime, feel free to analyze my project archives, check out my latest write-ups, or navigate back to the primary console.</p>
        
        <div class="button-container">
          <a href="${baseUrl}" class="button" target="_blank">Visit Portfolio</a>
        </div>

        <div class="divider"></div>

        <div class="social-container">
          <a href="https://github.com/Quantumboy80" class="social-icon" target="_blank">G</a>
          <a href="https://linkedin.com/in/sayan-som-26853928b" class="social-icon" target="_blank">L</a>
          <a href="https://leetcode.com/u/sayanHQR004/" class="social-icon" target="_blank">C</a>
          <a href="mailto:sayansom625@gmail.com" class="social-icon">E</a>
        </div>

        <div class="footer-pet-section">
          <div class="pet-card">
            <img src="https://sayan-som-portfolio.vercel.app/assets/mail/kai_zoomies.gif" width="48" height="48" alt="Kai" class="pet-gif" />
          </div>
          <div class="pet-card">
            <img src="https://sayan-som-portfolio.vercel.app/assets/mail/koto_idle.gif" width="48" height="48" alt="Koto" class="pet-gif" />
          </div>
        </div>

        <div class="footer-text">
          Love <span style="font-weight: bold; color: #000000;">sayan.dev</span>? <a href="${baseUrl}" class="footer-link">Explore my website</a> ✉️<br>
          sayan.dev • Kolkata, West Bengal, India
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

    // Resolve base URL dynamically from request headers
    const host = request.headers.get('host') || 'sayan-som-portfolio.vercel.app';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${proto}://${host}`;

    // Trigger welcome auto-responder email and await execution to prevent Vercel Serverless environment freezing
    await sendAutoResponseEmail(validatedData, baseUrl).catch((err) => {
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
