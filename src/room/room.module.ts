import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Room } from "./room.model";
import { UserService } from "src/user/user.service";

@Module({
    imports: [
        SequelizeModule.forFeature([Room]),
        UserService
    ],
    controllers: [],
    providers: [],
    exports: []
})
export class RoomModule{}