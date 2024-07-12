import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model";
import { UserRegisterDto } from "src/auth/dto/userRegister.dto";
import { Op } from "sequelize";

@Injectable()
export class UserService{
    constructor(@InjectModel(User) private readonly userModel:typeof User){}

    async addUser(userRegisterDto: UserRegisterDto): Promise<User>{
        return await this.userModel.create(userRegisterDto as any);
    }

    async getUserByUsername(username:string): Promise<User>{
        return await this.userModel.findOne({where: {
            username: {[Op.like]: `%${username}%`}
        }});
    }

    async getUsersByUsername(username:string, limit:number , offset:number): Promise<{rows:User[], count:number}>{
        return await this.userModel.findAndCountAll({limit:limit , offset:offset ,where: {
            username: {[Op.like]: `%${username}%`}
        }});
    }

    async getUserById(id:string): Promise<User>{
        return await this.userModel.findOne({where: {userID:id}});
    }

    async getAllUsers(limit:number , offset:number): Promise<{rows:User[], count:number}>{
        return await this.userModel.findAndCountAll({limit:limit , offset:offset});
    }
}