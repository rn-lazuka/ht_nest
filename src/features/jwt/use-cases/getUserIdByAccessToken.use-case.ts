import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import jwt from 'jsonwebtoken';

export class GetUserIdByAccessTokenCommand {
  constructor(public token: string) {}
}

@CommandHandler(GetUserIdByAccessTokenCommand)
export class GetUserIdByAccessTokenUseCase
  implements ICommandHandler<GetUserIdByAccessTokenCommand>
{
  constructor() {}

  async execute(
    command: GetUserIdByAccessTokenCommand,
  ): Promise<null | string> {
    const { token } = command;
    try {
      const decode = jwt.verify(
        token,
        process.env.PRIVATE_KEY_ACCESS_TOKEN!,
      ) as {
        userId: string;
      };
      return decode.userId;
    } catch (err) {
      return null;
    }
  }
}
