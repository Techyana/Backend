// mail.ts
import dotenv from 'dotenv';
import nodemailer, { Transporter } from 'nodemailer';

dotenv.config();

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_SECURE,
  MAIL_FROM,
  MAIL_TO,
} = process.env;

// Create a Transporter using env vars
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(MAIL_PORT),
  secure: MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  logger: true,
  debug: true,
});

// Async function to send a test message
async function sendTestEmail() {
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject: '📝 TypeScript Nodemailer Test',
    text: `Hello! This is a test email sent over port ${process.env.MAIL_PORT} with secure=${MAIL_SECURE}`,
  });

  console.log('Message sent:', info.messageId);
}

sendTestEmail().catch((err) => {
  console.error('Error sending email:', err);
  process.exit(1);
});
