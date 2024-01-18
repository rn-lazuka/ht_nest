import { JwtPayload } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtQueryRepository {
  constructor(protected jwtService: JwtService) {}

  getPayloadToken(refreshToken: string): JwtPayload | null {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: process.env.PRIVATE_KEY_REFRESH_TOKEN,
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
