import { Body, Controller, HttpCode, HttpStatus, Post} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserRegisterDto } from "./dto/userRegister.dto";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";
import { UserLoginDto } from "./dto/userLogin.dto";

@Controller("/api")
export class AuthController{
    constructor(private readonly authService:AuthService){}

    @Post("/register")
    @HttpCode(HttpStatus.OK)
    async register(@Body() userRegisterDto:UserRegisterDto){
        const token = await this.authService.register(userRegisterDto);
        return {status: HttpStatusMessage.SUCCESS , data: {token}}
    }

    @Post("/login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() userLoginDto:UserLoginDto){
        const tokens = await this.authService.login(userLoginDto);
        const accessToken = tokens.accessToken;
        const refreshToken = tokens.refreshToken;
        return {status: HttpStatusMessage.SUCCESS , data: {accessToken,refreshToken}};
    }
}