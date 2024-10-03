import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Room } from "./room.model";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [
        SequelizeModule.forFeature([Room]),
        UserModule
    ],
    controllers: [RoomController],
    providers: [RoomService],
    exports: [RoomService]
})
export class RoomModule{}