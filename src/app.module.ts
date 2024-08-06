import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { UserRoomModule } from './user_room/userRoom.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.production',
    }),
    SequelizeModule.forRoot({
      dialect: process.env.DIALECT as any,
      uri: process.env.DATABASE_URI,
      autoLoadModels: true,
      synchronize: true
    }),
    RoomModule, UserModule ,UserRoomModule, AuthModule
  ],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule { }
