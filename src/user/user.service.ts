import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { UpdateCurrentUserDTO } from './dtos/update-current-user.dto';
import { UpdateCurrentUserPasswordDTO } from './dtos/update-current-user-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  private saltOrRounds = 10;

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

  public async updateCurrentUserPassword(
    userId: string,
    updateCurrentUserPasswordDTO: UpdateCurrentUserPasswordDTO,
  ) {
    const { currentPassword, newPassword, confirmPassword } =
      updateCurrentUserPasswordDTO;

    const user = await this.prismaService.user.findUnique({
      where: {
        userId,
      },
    });

    const currentPasswordMatch = bcrypt.compareSync(
      currentPassword,
      user.password,
    );

    if (!currentPasswordMatch) {
      throw new UnprocessableEntityException('current password is not valid');
    }

    const isConfirmPasswordMatch = newPassword === confirmPassword;
    if (!isConfirmPasswordMatch) {
      throw new UnprocessableEntityException('confirm password is not match');
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.saltOrRounds);

    await this.prismaService.user.update({
      where: {
        userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'update password success',
    };
  }

  public async getCurrentUserGroups(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        userId,
      },
    });

    const groups = await this.prismaService.member.findMany({
      where: {
        userId: user.id,
      },
    });

    const groupsId = groups.map((group) => group.groupId);

    const joinedGroups = await this.prismaService.group.findMany({
      where: {
        AND: {
          id: {
            in: groupsId,
          },
          deletedAt: null,
        },
      },
    });

    return joinedGroups;
  }
}
