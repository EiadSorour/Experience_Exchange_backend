import { HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { UserRegisterDto } from "./dto/userRegister.dto";
import { User } from "src/user/user.model";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { AppError } from "src/utils/app.Error";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";
import { UserLoginDto } from "./dto/userLogin.dto";

@Injectable()
export class AuthService{
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ){}

    async register(userRegisterDto: UserRegisterDto): Promise<{accessToken:string,refreshToken:string}>{
        const oldUser:User = await this.userService.getUserByUsername(userRegisterDto.username);
        if(oldUser){
            throw new AppError("User already exists" , HttpStatusMessage.FAIL , HttpStatus.BAD_REQUEST);
        }
        
        userRegisterDto.password = await bcrypt.hash(userRegisterDto.password , 10);
        userRegisterDto.role = "client";
        const user = await this.userService.addUser(userRegisterDto);

        const payload = {   id: user.userID , username: user.username , role: user.role , 
                            profession: user.profession , isBlocked: user.isBlocked };

        const accessToken = this.jwtService.sign(payload , {expiresIn: process.env.ACCESS_TOKEN_EXPIRES});
        const refreshToken = this.jwtService.sign(payload, {expiresIn: process.env.REFRESH_TOKEN_EXPIRES});

        return {accessToken,refreshToken};
    }

    async login(userLoginDto:UserLoginDto): Promise<{accessToken:string,refreshToken:string}>{
        const user:User = await this.userService.getUserByUsername(userLoginDto.username);
        if(!user){
            throw new AppError("User doesn't exist" , HttpStatusMessage.FAIL , HttpStatus.BAD_REQUEST);
        }
        
        const correctPassword:boolean = await bcrypt.compare(userLoginDto.password , user.password);
        if(!correctPassword){
            throw new AppError("Incorrect password" , HttpStatusMessage.FAIL , HttpStatus.BAD_REQUEST);
        }

        if(user.isBlocked){
            throw new AppError("User is blocked, Contact admins" , HttpStatusMessage.FAIL , HttpStatus.BAD_REQUEST);
        }

        const payload = {   id: user.userID , username: user.username , role: user.role , 
            profession: user.profession , isBlocked: user.isBlocked };

        const accessToken = this.jwtService.sign(payload , {expiresIn: process.env.ACCESS_TOKEN_EXPIRES});
        const refreshToken = this.jwtService.sign(payload, {expiresIn: process.env.REFRESH_TOKEN_EXPIRES});

        return {accessToken,refreshToken};
    }

    async getAccessToken(payload:any): Promise<string>{
        const modifiedPayload = {   id: payload.id , username: payload.username , role: payload.role , 
            profession: payload.profession , isBlocked: payload.isBlocked };
            
        const newAccessToken = this.jwtService.sign(modifiedPayload, {expiresIn: process.env.ACCESS_TOKEN_EXPIRES});
        return newAccessToken;
    }
}