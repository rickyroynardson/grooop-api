import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserID } from './user.decorator';
import { UpdateCurrentUserDTO } from './dtos/update-current-user.dto';
import { UpdateCurrentUserPasswordDTO } from './dtos/update-current-user-password.dto';

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

  @Patch('/me/password')
  @UseGuards(AuthGuard)
  public async updateCurrentUserPassword(
    @UserID() userId: string,
    @Body() body: UpdateCurrentUserPasswordDTO,
  ) {
    return await this.userService.updateCurrentUserPassword(userId, body);
  }

  @Get('/me/groups')
  @UseGuards(AuthGuard)
  public async getCurrentUserGroups(@UserID() userId: string) {
    return await this.userService.getCurrentUserGroups(userId);
  }
}
