import { Injectable } from "@nestjs/common";
import { RoomService } from "src/room/room.service";
import { User } from "src/user/user.model";
import { UserService } from "src/user/user.service";
import { UserRoomService } from "src/user_room/userRoom.service";

@Injectable()
export class WebsocketService{
    constructor(
        private readonly userService:UserService,
        private readonly roomServic:RoomService,
        private readonly userRoomService:UserRoomService,
    ){}

    async saveNewRoom(roomID:string , topic:string , creatorUsername:string): Promise<void>{

        // get userid by username
        const user:User = await this.userService.getUserByExactUsername(creatorUsername);

        // Save room into database
        await this.roomServic.addRoom(roomID , topic , user.dataValues.userID);
    }

    async addUserToRoom(username:string , roomID:string): Promise<void>{
        
        // get userid by username
        const user:User = await this.userService.getUserByExactUsername(username);

        // Save room into database
        await this.userRoomService.addUserRoom(user.dataValues.userID , roomID);
    }
}