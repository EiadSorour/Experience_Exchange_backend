import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";


@Module({
    imports: [
        ConfigModule.forRoot({envFilePath: '.env.development'}),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET
        }),
        UserModule
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: []
})
export class AuthModule{}