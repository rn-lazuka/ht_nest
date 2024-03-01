import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { JwtService as NestJwtService } from '@nestjs/jwt/dist/jwt.service';

export class CreateAccessJwtTokenCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreateAccessJwtTokenCommand)
export class CreateAccessJwtTokenUseCase
  implements ICommandHandler<CreateAccessJwtTokenCommand>
{
  constructor(protected jwtServiceNest: NestJwtService) {}

  async execute(command: CreateAccessJwtTokenCommand): Promise<string> {
    const { userId } = command;
    const accessToken = this.jwtServiceNest.sign(
      { userId },
      {
        secret: process.env.PRIVATE_KEY_ACCESS_TOKEN!,
        expiresIn: process.env.EXPIRATION_TIME_ACCESS_TOKEN!,
      },
    );
    return accessToken;
  }
}
