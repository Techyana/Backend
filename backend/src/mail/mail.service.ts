// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER, // e.g. your Gmail address
      pass: process.env.MAIL_PASS, // app password or OAuth token
    },
  });

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #D31D3F;">Welcome to Ricoh Workshop Portal</h2>
        <p>Hi ${name},</p>
        <p>We're excited to have you onboard. Your account has been successfully activated.</p>
        <p>Please set your password to begin using the platform.</p>
        <p style="margin-top: 20px;">If you have any questions, feel free to reach out to our support team.</p>
        <p>— Ricoh Workshop Portal Team</p>
      </div>
    `;
    await this.transporter.sendMail({
      from: `"Ricoh Workshop Portal" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Welcome to Ricoh Workshop Portal',
      html,
    });
  }

  async sendPasswordChangeConfirmation(to: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #D31D3F;">Password Updated Successfully</h2>
        <p>Hi ${name},</p>
        <p>Your password was changed successfully. If this wasn't you, please contact support immediately.</p>
        <p style="margin-top: 20px;">Stay secure, and thank you for using Ricoh Workshop Portal.</p>
        <p>— Ricoh Workshop Portal Team</p>
      </div>
    `;
    await this.transporter.sendMail({
      from: `"Ricoh Workshop Portal" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Your Password Has Been Changed',
      html,
    });
  }
}
