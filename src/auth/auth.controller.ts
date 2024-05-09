import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dtos/register.dto';
import { LoginDTO } from './dtos/login.dto';
import { AuthGuard } from './auth.guard';
import { UserID } from 'src/user/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async register(@Body() body: RegisterDTO) {
    return await this.authService.register(body);
  }

  @Post('login')
  public async login(@Body() body: LoginDTO) {
    return await this.authService.login(body);
  }

  @Get('verification')
  public async verifyAccount(@Query('token') token: string) {
    return await this.authService.verifyAccount(token);
  }

  @Post('verification')
  @UseGuards(AuthGuard)
  public async resendVerification(@UserID() userId: string) {
    return await this.authService.resendVerification(userId);
  }
}
