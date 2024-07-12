import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model";
import { UserRegisterDto } from "src/auth/dto/userRegister.dto";

@Injectable()
export class UserService{
    constructor(@InjectModel(User) private readonly userModel:typeof User){}

    async addUser(userRegisterDto: UserRegisterDto): Promise<User>{
        return await this.userModel.create(userRegisterDto as any);
    }

    async getUserByUsername(username:string): Promise<User>{
        return await this.userModel.findOne({where: {username:username}});
    }

    async getAllUsers(limit:number , offset:number): Promise<User[]>{
        return await this.userModel.findAll({limit:limit , offset:offset});
    }
}