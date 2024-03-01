import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { JwtService as NestJwtService } from '@nestjs/jwt/dist/jwt.service';

export class CreateRefreshJwtTokenCommand {
  constructor(
    public userId: string,
    public deviceId: string | null,
  ) {}
}

@CommandHandler(CreateRefreshJwtTokenCommand)
export class CreateRefreshJwtTokenUseCase
  implements ICommandHandler<CreateRefreshJwtTokenCommand>
{
  constructor(protected jwtServiceNest: NestJwtService) {}

  async execute(command: CreateRefreshJwtTokenCommand): Promise<string> {
    const { userId, deviceId } = command;
    const refreshToken = this.jwtServiceNest.sign(
      { userId, deviceId: deviceId ?? uuidv4() },
      {
        secret: process.env.PRIVATE_KEY_REFRESH_TOKEN!,
        expiresIn: process.env.EXPIRATION_TIME_REFRESH_TOKEN!,
      },
    );
    return refreshToken;
  }
}
