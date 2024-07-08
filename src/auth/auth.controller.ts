import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserRegisterDto } from "./dto/userRegister.dto";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";
import { UserLoginDto } from "./dto/userLogin.dto";
import { Response } from "express";
import { RefreshGuard } from "src/guards/refresh.guard";
import { AuthGurad } from "src/guards/auth.guard";

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

    @Get("/refresh")
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshGuard)
    async gethAccessToken(@Req() req:any){
        const payload = req.payload;
        const newAccessToken = await this.authService.getAccessToken(payload);
        return ({status: HttpStatusMessage.SUCCESS , data: {newAccessToken}});
    }
    
    @Get("/authenticated")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGurad)
    async authenticated(@Req() req:any){
        const userRole = req.payload.role;
        return ( {status: HttpStatusMessage.SUCCESS , data: {auth:true , role: userRole}} );
    }

}