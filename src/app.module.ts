import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { UserRoomModule } from './user_room/userRoom.module';
import { AuthModule } from './auth/auth.module';
import { WebsocketModule } from './websocket/websocket.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
    }),
    SequelizeModule.forRoot({
      dialect: process.env.DIALECT_USERNAME as any,
      host: process.env.HOST,
      port: process.env.PORT as any,
      username: process.env.DIALECT_USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      autoLoadModels: true,
      synchronize: true
    }),
    RoomModule, UserModule ,UserRoomModule, MessageModule ,AuthModule, WebsocketModule
  ],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule { }
