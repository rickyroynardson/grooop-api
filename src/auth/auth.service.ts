import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { RegisterDTO } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private saltOrRounds = 10;

  public async register(registerDTO: RegisterDTO) {
    const { email, password } = registerDTO;

    const userWithSameEmail = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userWithSameEmail) {
      throw new UnprocessableEntityException('email has been used');
    }

    const hashedPassword = await bcrypt.hash(password, this.saltOrRounds);

    const newUser = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      message: 'user register success',
      data: {
        userId: newUser.userId,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    };
  }

  public async login(loginDTO: LoginDTO) {
    const { email, password } = loginDTO;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnprocessableEntityException('invalid credentials');
    }

    const isPasswordMatch = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatch) {
      throw new UnprocessableEntityException('invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      userId: user.userId,
    });

    return {
      message: 'user login success',
      data: {
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          emailVerifiedAt: user.emailVerifiedAt,
        },
        accessToken,
      },
    };
  }
}
