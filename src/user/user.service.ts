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

    async userAdminUnadmin(userID:string): Promise<User>{
        const user: User = await this.userModel.findOne({where: {userID:userID}});
        if(user.role === "admin"){
            return (await this.userModel.update({ role: "client" }, {where: {userID: userID} , returning:true} ))[1][0];
        }else{
            return (await this.userModel.update({ role: "admin" }, {where: {userID: userID} , returning:true} ))[1][0];
        }
    }

    async userBlockUnblock(userID:string): Promise<User>{
        const user: User = await this.userModel.findOne({where: {userID:userID}});
        return (await this.userModel.update({ isBlocked: !user.isBlocked }, {where: {userID: userID} , returning:true} ))[1][0];
    }

    async getUserByUsername(username:string): Promise<User>{
        return await this.userModel.findOne({where: {
            username: {[Op.like]: `%${username}%`}
        }});
    }

    async getUsersByUsername(username:string, limit:number , offset:number): Promise<{rows:User[], count:number}>{
        return await this.userModel.findAndCountAll({limit:limit , offset:offset, order:[["username" , "ASC"]] ,where: {
            username: {[Op.like]: `%${username}%`}
        }});
    }

    async getUserById(id:string): Promise<User>{
        return await this.userModel.findOne({where: {userID:id}});
    }

    async getAllUsers(limit:number , offset:number): Promise<{rows:User[], count:number}>{
        return await this.userModel.findAndCountAll({limit:limit , offset:offset , order:[["username" , "ASC"]] });
    }
}