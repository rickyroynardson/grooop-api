import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dtos/register.dto';
import { LoginDTO } from './dtos/login.dto';

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
}
