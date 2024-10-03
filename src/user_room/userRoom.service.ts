import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserRoom } from "./userRoom.model";
import { UserService } from "src/user/user.service";
import {validate} from "uuid";
import { AppError } from "src/utils/app.Error";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";

@Injectable()
export class UserRoomService{
    constructor(
        @InjectModel(UserRoom) private readonly userRoomModel:typeof UserRoom,
        private readonly userService : UserService
    ){}

    async getAllRoomUsers(roomID:string){
        if(!validate(roomID)){
            throw new AppError("Invalid UUID" , HttpStatusMessage.FAIL , HttpStatus.BAD_REQUEST);
        }

        const userRooms:UserRoom[] = await this.userRoomModel.findAll({where: {roomID:roomID}});
        const userIDs = [];
        const usernames = [];
        const users = [];

        userRooms.forEach(userRoom => {
            userIDs.push(userRoom.dataValues.userID);
        }); 

        for(const userID of userIDs){
            const user = await this.userService.getUserById(userID);
            usernames.push(user.username);
        }

        for (let i = 0; i < usernames.length; i++) {
            users.push({userID: userIDs[i] , username: usernames[i]});
        }

        return users;
    }

    async addUserRoom(userID:string , roomID:string): Promise<void>{
        await this.userRoomModel.create({userID , roomID});
    }
}