import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserID } from './user.decorator';
import { UpdateCurrentUserDTO } from './dtos/update-current-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  public async getCurrentUser(@UserID() userId: string) {
    return await this.userService.getCurrentUser(userId);
  }

  @Patch('/me')
  @UseGuards(AuthGuard)
  public async updateCurrentUser(
    @UserID() userId: string,
    @Body() body: UpdateCurrentUserDTO,
  ) {
    return await this.userService.updateCurrentUser(userId, body);
  }
}
