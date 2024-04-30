import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDTO } from './dtos/create-group.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserID } from 'src/user/user.decorator';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @UseGuards(AuthGuard)
  public async getGroups(@UserID() userId: string) {
    return await this.groupService.getGroups(userId);
  }

  @Post()
  @UseGuards(AuthGuard)
  public async createGroup(
    @UserID() userId: string,
    @Body() body: CreateGroupDTO,
  ) {
    return await this.groupService.createGroup(userId, body);
  }
}
