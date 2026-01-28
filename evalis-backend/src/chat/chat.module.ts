import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Chat } from './entities/chat.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatGroupMember } from './entities/chat-group-member.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatNotification } from './entities/chat-notification.entity';
import { UserOnlineStatus } from './entities/user-online-status.entity';
import { User } from '../users/entities/user.entity';
import { DirectChatService } from './direct-chat.service';
import { GroupChatService } from './group-chat.service';
import { ChatUtilityService } from './chat-utility.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chat,
      ChatGroup,
      ChatGroupMember,
      ChatMessage,
      ChatNotification,
      UserOnlineStatus,
      User,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      signOptions: { expiresIn: '24h' },
    }),
    UsersModule,
  ],
  controllers: [ChatController],
  providers: [DirectChatService, GroupChatService, ChatUtilityService, ChatGateway],
  exports: [DirectChatService, GroupChatService, ChatUtilityService, ChatGateway],
})
export class ChatModule {}
