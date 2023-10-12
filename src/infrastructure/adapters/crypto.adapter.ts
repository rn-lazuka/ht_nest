import bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoAdapter {
  async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
