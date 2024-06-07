import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./user.model";

@Module({
    imports: [SequelizeModule.forFeature([User])],
    controllers: [],
    providers: [],
    exports: []
})
export class UserModule{}