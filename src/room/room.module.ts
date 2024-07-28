import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Room } from "./room.model";
import { UserService } from "src/user/user.service";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";

@Module({
    imports: [
        SequelizeModule.forFeature([Room]),
        UserService
    ],
    controllers: [RoomController],
    providers: [RoomService],
    exports: []
})
export class RoomModule{}