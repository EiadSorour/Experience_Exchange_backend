import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserRoom } from "./userRoom.model";
import { UserService } from "src/user/user.service";

@Injectable()
export class UserRoomService{
    constructor(
        @InjectModel(UserRoom) private readonly userRoomModel:typeof UserRoom,
        private readonly userService : UserService
    ){}

    async getAllRoomUsers(roomID:string){
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
}