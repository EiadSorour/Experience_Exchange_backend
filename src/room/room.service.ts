import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Room } from "./room.model";

@Injectable()
export class RoomService{
    constructor(@InjectModel(Room) private readonly roomModel: typeof Room){}

    async getAllRooms(limit:number , offset:number): Promise<{rows:Room[], count:number}>{
        return await this.roomModel.findAndCountAll({limit:limit , offset:offset , order:[["topic" , "ASC"]] });
    }

    async getAllRoomsByCreatorID(creatorID: string, limit:number , offset:number): Promise<{rows:Room[], count:number}>{
        return await this.roomModel.findAndCountAll({where:{creatorID:creatorID},limit:limit , offset:offset , order:[["topic" , "ASC"]] });
    }

    async getAllRoomsByTopic(topic: string, limit:number , offset:number): Promise<{rows:Room[], count:number}>{
        return await this.roomModel.findAndCountAll({where:{topic:topic},limit:limit , offset:offset , order:[["topic" , "ASC"]] });
    }

}