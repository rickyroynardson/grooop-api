import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { RegisterDTO } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
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

  public async verifyAccount(token: string) {
    try {
      const decodedToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_VERIFY_SECRET,
      });

      await this.prismaService.user.update({
        data: {
          emailVerifiedAt: new Date(),
        },
        where: {
          userId: decodedToken.userId,
        },
      });

      return {
        message: 'account verified success',
      };
    } catch (error) {
      throw new UnprocessableEntityException('invalid verification token');
    }
  }

  public async resendVerification(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        userId,
      },
    });

    if (!user) {
      throw new UnprocessableEntityException('invalid user');
    }

    if (user.emailVerifiedAt) {
      throw new UnprocessableEntityException('account already verified');
    }

    try {
      const verificationToken = await this.jwtService.signAsync(
        {
          userId,
        },
        {
          secret: process.env.JWT_VERIFY_SECRET,
          expiresIn: process.env.JWT_VERIFY_EXPIRES_IN,
        },
      );
      const verificationLink = `http://localhost:4000/auth/verification?token=${verificationToken}`;

      await this.mailService.sendMail({
        from: `noreply@${process.env.MAIL_HOST}`,
        to: user.email,
        subject: 'Email Verification',
        text: 'Email Verification',
        html: `<div><h1>Verify your account email</h1><a href=${verificationLink} target="_blank">Click to verify</div>`,
      });

      return { message: 'verification email sent' };
    } catch (error) {
      throw new InternalServerErrorException('failed to send verification');
    }
  }
}
