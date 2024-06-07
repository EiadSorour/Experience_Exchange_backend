import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Room } from "./room.model";

@Module({
    imports: [SequelizeModule.forFeature([Room])],
    controllers: [],
    providers: [],
    exports: []
})
export class RoomModule{}