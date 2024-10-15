import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway";
import { WebsocketService } from "./websocket.service";
import { UserModule } from "src/user/user.module";
import { RoomModule } from "src/room/room.module";
import { UserRoomModule } from "src/user_room/userRoom.module";
import { MessageModule } from "src/message/message.module";

@Module({
    imports: [
        UserModule,
        RoomModule,
        UserRoomModule,
        MessageModule
    ],
    controllers: [],
    providers: [WebsocketGateway , WebsocketService],
    exports: []
})
export class WebsocketModule{}