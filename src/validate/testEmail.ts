import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

// Read credentials manually from .env.local
const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

async function main() {
  const gmailUser = env.GMAIL_USER;
  const gmailPass = env.GMAIL_PASS;

  console.log('Testing with GMAIL_USER:', gmailUser);
  console.log('Testing with GMAIL_PASS length:', gmailPass ? gmailPass.length : 0);

  if (!gmailUser || !gmailPass) {
    console.error('Missing GMAIL_USER or GMAIL_PASS in .env.local');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  try {
    console.log('Attempting to connect and send test mail...');
    const info = await transporter.sendMail({
      from: `"Sayan Som Test" <${gmailUser}>`,
      to: gmailUser,
      subject: 'Nodemailer SMTP Test Connection',
      text: 'This is a diagnostic connection test from your portfolio local environment.',
    });
    console.log('SMTP Connection Success! Message ID:', info.messageId);
  } catch (error) {
    console.error('SMTP Connection Failure Details:', error);
  }
}

main();
