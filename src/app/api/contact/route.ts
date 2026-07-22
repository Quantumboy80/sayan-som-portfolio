import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
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

  const attachments: Array<{
    filename: string;
    path: string;
    cid: string;
  }> = [];

  const topBannerPath = path.join(process.cwd(), 'public', 'assets', 'mail', 'top-banner.gif');
  const kaiPath = path.join(process.cwd(), 'public', 'assets', 'mail', 'kai_zoomies.gif');
  const kotoPath = path.join(process.cwd(), 'public', 'assets', 'mail', 'koto_idle.gif');

  if (fs.existsSync(topBannerPath)) {
    attachments.push({ filename: 'top-banner.gif', path: topBannerPath, cid: 'topbanner@sayan.dev' });
  }
  if (fs.existsSync(kaiPath)) {
    attachments.push({ filename: 'kai_zoomies.gif', path: kaiPath, cid: 'kaizoomies@sayan.dev' });
  }
  if (fs.existsSync(kotoPath)) {
    attachments.push({ filename: 'koto_idle.gif', path: kotoPath, cid: 'kotoidle@sayan.dev' });
  }

  const htmlContent = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Thank you for reaching out!</title>
    </head>
    <body style="margin:0;padding:40px 10px;background-color:#e5ecf6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#000000;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:540px;margin:0 auto;background-color:#fcfaf2;border:2px solid #000000;border-radius:8px;">
        <tr>
          <td style="padding:40px 30px;text-align:center;">

            <!-- Header Logo -->
            <p style="font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:bold;color:#000000;margin:0 0 25px 0;">🪙 sayan.dev</p>

            <!-- Top Banner GIF -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 30px 0;border:2px solid #000000;border-radius:8px;overflow:hidden;background-color:#000000;">
              <tr>
                <td style="line-height:0;font-size:0;">
                  <img src="cid:topbanner@sayan.dev" alt="Retro Pixel Banner" width="476" style="width:100%;height:auto;display:block;" />
                </td>
              </tr>
            </table>

            <!-- Title -->
            <h1 style="font-family:system-ui,-apple-system,sans-serif;color:#000000;font-size:24px;font-weight:800;margin:0 0 5px 0;text-align:left;letter-spacing:-0.5px;">Transmission Logged ⚡</h1>
            <p style="font-family:'Courier New',Courier,monospace;color:#ff5500;font-size:9px;font-weight:bold;letter-spacing:0.5px;text-align:left;margin:0 0 25px 0;text-transform:uppercase;">STATUS: BUFFER QUEUE RUNNING // PORT: 8080</p>

            <!-- Body Text -->
            <p style="color:#000000;font-size:15px;line-height:24px;margin:0 0 20px 0;text-align:left;">Got a project, feedback, or a question for me?</p>

            <p style="color:#000000;font-size:15px;line-height:24px;margin:0 0 20px 0;text-align:left;">Your incoming message successfully reached the <strong style="border-bottom:2px solid #000000;">sayan.dev</strong> terminal core on ${new Date().toLocaleDateString()}.</p>

            <p style="color:#000000;font-size:15px;line-height:24px;margin:0 0 20px 0;text-align:left;">I have registered your transmission details in my main buffer array. An active response channel will be established in approximately <strong style="border-bottom:2px solid #000000;">24 cycles</strong> (hours).</p>

            <p style="color:#000000;font-size:15px;line-height:24px;margin:0 0 20px 0;text-align:left;">In the meantime, feel free to analyze my project archives, check out my latest write-ups, or navigate back to the primary console.</p>

            <!-- CTA Button -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:35px 0;">
              <tr>
                <td align="center">
                  <a href="${baseUrl}" target="_blank" style="display:inline-block;background-color:#f3c623;color:#000000;font-family:'Courier New',Courier,monospace;text-decoration:none;padding:14px 32px;font-weight:bold;font-size:11px;border:2px solid #000000;border-radius:6px;">Visit Portfolio</a>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <hr style="border:none;border-top:2px solid #000000;margin:40px 0 30px 0;" />

            <!-- Social Icons -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:25px auto;">
              <tr>
                <td style="padding:0 8px;"><a href="https://github.com/Quantumboy80" target="_blank" style="display:inline-block;width:32px;height:32px;line-height:32px;border-radius:50%;background-color:#000000;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;text-align:center;">G</a></td>
                <td style="padding:0 8px;"><a href="https://linkedin.com/in/sayan-som-26853928b" target="_blank" style="display:inline-block;width:32px;height:32px;line-height:32px;border-radius:50%;background-color:#000000;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;text-align:center;">in</a></td>
                <td style="padding:0 8px;"><a href="https://leetcode.com/u/sayanHQR004/" target="_blank" style="display:inline-block;width:32px;height:32px;line-height:32px;border-radius:50%;background-color:#000000;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;text-align:center;">C</a></td>
                <td style="padding:0 8px;"><a href="mailto:sayansom625@gmail.com" style="display:inline-block;width:32px;height:32px;line-height:32px;border-radius:50%;background-color:#000000;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;text-align:center;">✉</a></td>
              </tr>
            </table>

            <!-- Pet GIFs -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:25px auto;">
              <tr>
                <td style="padding:0 8px;">
                  <table role="presentation" cellpadding="5" cellspacing="0" border="0" style="border:2px solid #000000;background-color:#ffffff;border-radius:6px;">
                    <tr>
                      <td style="line-height:0;font-size:0;">
                        <img src="cid:kaizoomies@sayan.dev" width="48" height="48" alt="Kai" style="display:block;" />
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="padding:0 8px;">
                  <table role="presentation" cellpadding="5" cellspacing="0" border="0" style="border:2px solid #000000;background-color:#ffffff;border-radius:6px;">
                    <tr>
                      <td style="line-height:0;font-size:0;">
                        <img src="cid:kotoidle@sayan.dev" width="48" height="48" alt="Koto" style="display:block;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <p style="font-size:12px;line-height:18px;color:#555555;margin:25px 0 0 0;">
              Love <strong style="color:#000000;">sayan.dev</strong>? <a href="${baseUrl}" style="color:#0000ee;text-decoration:underline;">Explore my website</a> ✉️<br/>
              sayan.dev · Kolkata, West Bengal, India
            </p>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Sayan Som" <${gmailUser}>`,
      to: data.email.trim(),
      subject: `Thank you for reaching out, ${data.name.split(' ')[0]}!`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
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
