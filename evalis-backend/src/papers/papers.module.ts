import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paper } from './paper.entity';
import { User } from '../users/entities/user.entity';
import { PapersService } from './papers.service';
import { PapersController } from './papers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Paper, User])],
  controllers: [PapersController],
  providers: [PapersService],
  exports: [PapersService],
})
export class PapersModule {}
