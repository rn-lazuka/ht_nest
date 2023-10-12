import { Injectable } from '@nestjs/common';
import { EmailAdapter } from '../adapters/email.adapter';

@Injectable()
export class EmailManager {
  constructor(protected emailAdapter: EmailAdapter) {}

  async sendEmailConfirmationCode(email: string, code: string) {
    const mail = `<div><h1>Thank for your registration</h1><p>To finish registration please follow the link below:
        <a href="https://somesite.com/confirm-email?code=${code}">complete registration</a></p></div>`;
    const info = await this.emailAdapter.sendMail(
      email,
      'Confirmation code',
      mail,
    );
    return info ? info : null;
  }

  async sendPasswordRecoveryCode(email: string, code: string) {
    const mail = `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`;
    const info = await this.emailAdapter.sendMail(email, 'Recovery code', mail);
    return info ? info : true;
  }
}
