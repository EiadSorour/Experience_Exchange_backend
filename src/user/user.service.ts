import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model";
import { UserRegisterDto } from "src/auth/dto/userRegister.dto";

@Injectable()
export class UserService{
    constructor(@InjectModel(User) private readonly userModel:typeof User){}

    async addUser(userRegisterDto: UserRegisterDto): Promise<void>{
        try{
            await this.userModel.create(userRegisterDto as any);
        }catch(error){
            throw new HttpException(error.message , 501);
        }
    }
}