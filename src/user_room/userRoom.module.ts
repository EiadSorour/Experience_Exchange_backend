import { Module } from "@nestjs/common";
import { UserRoom } from "./userRoom.model";
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
    imports: [SequelizeModule.forFeature([UserRoom])],
    controllers: [],
    providers: [],
    exports: []
})
export class UserRoomModule{}