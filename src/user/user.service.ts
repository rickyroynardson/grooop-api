import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { UpdateCurrentUserDTO } from './dtos/update-current-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getCurrentUser(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        userId,
      },
    });

    return {
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }

  public async updateCurrentUser(
    userId: string,
    updateCurrentUserDTO: UpdateCurrentUserDTO,
  ) {
    const { firstName, lastName, email } = updateCurrentUserDTO;

    let user = await this.prismaService.user.findUnique({
      where: {
        userId,
      },
    });

    if (email && user.email !== email) {
      const userWithSameEmail = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });

      if (userWithSameEmail) {
        throw new UnprocessableEntityException('email has been used');
      }

      user = await this.prismaService.user.update({
        where: {
          userId,
        },
        data: {
          firstName,
          lastName,
          email,
          emailVerifiedAt: null,
        },
      });
    }

    user = await this.prismaService.user.update({
      where: {
        userId,
      },
      data: {
        firstName,
        lastName,
      },
    });

    return {
      message: 'update profile success',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }
}
