import { HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { UserRegisterDto } from "./dto/userRegister.dto";
import { User } from "src/user/user.model";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { AppError } from "src/utils/app.Error";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";

@Injectable()
export class AuthService{
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ){}

    async register(userRegisterDto: UserRegisterDto): Promise<string>{
        const oldUser:User = await this.userService.getUserByUsername(userRegisterDto.username);
        if(oldUser){
            throw new AppError("User already exists" , HttpStatusMessage.FAIL , HttpStatus.BAD_REQUEST);
        }
        
        userRegisterDto.password = await bcrypt.hash(userRegisterDto.password , 10);
        userRegisterDto.role = "client";
        const user = await this.userService.addUser(userRegisterDto);

        const payload = {   id: user.userID , username: user.username , role: user.role , 
                            profession: user.profession , isBlock3d: user.isBlocked };
        return this.jwtService.sign(payload);
    }
}