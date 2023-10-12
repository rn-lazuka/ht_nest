import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAdapter {
  async sendMail(email: string, subject: string, message: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'arkdorf1@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      //TODO: почему требует 3 аргумента?
      await transporter.sendMail({
        from: 'Romych <arkdorf1@gmail.com>',
        to: email,
        subject: subject,
        html: message,
      });
      return true;
    } catch (e) {
      console.log('emailAdapter => sendEmailConfirmation => error:', e);
      return false;
    }
  }
}
