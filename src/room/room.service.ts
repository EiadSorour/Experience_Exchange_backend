import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Room } from "./room.model";
import { UserService } from "src/user/user.service";
import { User } from "src/user/user.model";
import { Op } from "sequelize";
import {validate} from "uuid";
import { AppError } from "src/utils/app.Error";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";

@Injectable()
export class RoomService{
    constructor(
        @InjectModel(Room) private readonly roomModel: typeof Room,
        private readonly userService:UserService
    ){}

    async modifyRows(rows:any){
        var newRows = [];
        var dataValues = [];
        var usernames = [];

        for(const row of rows){
            var user = await this.userService.getUserById(row.dataValues.creatorID);
            usernames.push(user.username);
        }

        newRows = rows.map((row,index)=>{
            return {...row, dataValues:{...row.dataValues , creatorUsername:usernames[index]}}
        })

        newRows.forEach(newRow => {
            dataValues.push(newRow.dataValues);
        });

        return dataValues;
    }

    async addRoom(roomID: string , topic: string , creatorID:string): Promise<void>{
        await this.roomModel.create({roomID , topic , creatorID});
    }

    async getAllRooms(limit:number , offset:number): Promise<any>{
        const {rows , count} = await this.roomModel.findAndCountAll({limit:limit , offset:offset , order:[["topic" , "ASC"]] });
        const modifiedRows = await this.modifyRows(rows);
        return {rows:modifiedRows ,count};
    }

    async getRoomByID(id:string): Promise<any>{
        if(!validate(id)){
            throw new AppError("Invalid UUID" , HttpStatusMessage.FAIL , HttpStatus.BAD_REQUEST);
        }

        const room = await this.roomModel.findOne({where: {roomID:id}});
        if(!room){
            return [];
        }

        const creatorUsername = (await this.userService.getUserById(room.creatorID)).username;
        var newRoom = {...room , dataValues:{...room.dataValues , creatorUsername:creatorUsername}};
        return newRoom.dataValues;
    }

    async getAllRoomsByCreatorID(creatorID: string, limit:number , offset:number): Promise<any>{
        if(!validate(creatorID)){
            throw new AppError("Invalid UUID" , HttpStatusMessage.FAIL , HttpStatus.BAD_REQUEST);
        }

        const {rows , count} = await this.roomModel.findAndCountAll({where:{creatorID:creatorID},limit:limit , offset:offset , order:[["topic" , "ASC"]] });
        const modifiedRows = await this.modifyRows(rows);
        return {rows:modifiedRows ,count};
    }
    
    async getAllRoomsByTopic(topic: string, limit:number , offset:number): Promise<any>{
        const {rows , count} = await this.roomModel.findAndCountAll({where:{topic:{[Op.iLike]: `%${topic}%`}},limit:limit , offset:offset , order:[["topic" , "ASC"]] });
        const modifiedRows = await this.modifyRows(rows);
        return {rows:modifiedRows ,count};
    }
    
    async getAllRoomsByUsername(username: string, limit:number , offset:number): Promise<any>{
        const user:User = await this.userService.getUserByExactUsername(username);
        if(!user){
            return {rows:[] , count:0};
        }else{
            const {rows , count} = await this.roomModel.findAndCountAll({where:{creatorID:user.dataValues.userID},limit:limit , offset:offset , order:[["topic" , "ASC"]] });
            const modifiedRows = await this.modifyRows(rows);
            return {rows:modifiedRows ,count};
        }
    }
}