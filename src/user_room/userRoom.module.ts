import { Module } from "@nestjs/common";
import { UserRoom } from "./userRoom.model";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserRoomController } from "./userRoom.controller";
import { UserRoomService } from "./userRoom.service";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [
        SequelizeModule.forFeature([UserRoom]),
        UserModule
    ],
    controllers: [UserRoomController],
    providers: [UserRoomService],
    exports: [UserRoomService]
})
export class UserRoomModule{}