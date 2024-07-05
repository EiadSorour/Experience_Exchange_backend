import { Body, Controller, HttpCode, HttpStatus, Post, Res} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserRegisterDto } from "./dto/userRegister.dto";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";
import { UserLoginDto } from "./dto/userLogin.dto";
import { Response } from "express";

@Controller("/api")
export class AuthController{
    constructor(private readonly authService:AuthService){}

    @Post("/register")
    @HttpCode(HttpStatus.OK)
    async register(@Body() userRegisterDto:UserRegisterDto , @Res() res:Response){
        const tokens = await this.authService.register(userRegisterDto);
        const accessToken = tokens.accessToken;
        const refreshToken = tokens.refreshToken;
        res.cookie("refresh_token" , refreshToken , {httpOnly: true , sameSite:"strict"});
        res.send( {status: HttpStatusMessage.SUCCESS , data: {accessToken}} );
    }

    @Post("/login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() userLoginDto:UserLoginDto , @Res() res:Response){
        const tokens = await this.authService.login(userLoginDto);
        const accessToken = tokens.accessToken;
        const refreshToken = tokens.refreshToken;
        res.cookie("refresh_token" , refreshToken , {httpOnly: true , sameSite:"strict"});
        res.send( {status: HttpStatusMessage.SUCCESS , data: {accessToken}} );
    }
}