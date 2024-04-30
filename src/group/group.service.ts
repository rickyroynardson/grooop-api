import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { CreateGroupDTO } from './dtos/create-group.dto';

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getGroups(userId: string) {
    const groups = await this.prismaService.group.findMany({
      where: {
        isPublic: true,
      },
      include: {
        Member: {
          include: {
            user: true,
          },
        },
      },
    });

    const groupsResponse = groups.map((group) => {
      const groupResponse = {
        id: group.id,
        name: group.name,
        description: group.description,
        createdAt: group.createdAt,
        members: group.Member.length,
      };
      if (group.Member.find((member) => member.user.userId === userId)) {
        return {
          ...groupResponse,
          isJoined: true,
        };
      } else {
        return {
          ...groupResponse,
          isJoined: false,
        };
      }
    });

    return groupsResponse;
  }

  public async createGroup(userId: string, createGroupDTO: CreateGroupDTO) {
    const { name, description, isPublic } = createGroupDTO;

    const newGroup = await this.prismaService.group.create({
      data: {
        name,
        description,
        isPublic,
        Member: {
          create: {
            role: 'LEADER',
            user: {
              connect: {
                userId,
              },
            },
          },
        },
      },
    });

    return {
      message: 'create group success',
      data: newGroup,
    };
  }
}
