import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersPublicController } from './users-public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Role, Permission])],
  controllers: [UsersController, UsersPublicController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
