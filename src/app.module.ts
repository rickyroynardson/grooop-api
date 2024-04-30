import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, GroupModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
