import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { RoomService } from "./room.service";
import { AdminGurad } from "src/guards/admin.guard";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";
import { Room } from "./room.model";

@Controller("/api/rooms")
export class RoomController{
    constructor(private readonly roomService:RoomService){}

    @Get("/")
    @HttpCode(HttpStatus.OK) 
    @UseGuards(AdminGurad)
    async getAllRooms(@Query("limit") limit:number , @Query("page") page:number){
        const offset = limit*(page-1);
        const {rows , count} = await this.roomService.getAllRooms(limit,offset);
        return ({status: HttpStatusMessage.SUCCESS , data: {rooms:rows , count:count}});
    }

    @Get("/id")
    @HttpCode(HttpStatus.OK) 
    @UseGuards(AdminGurad)
    async getRoomById(@Query("roomID") roomID:string){
        const room:Room = await this.roomService.getRoomByID(roomID);
        return ({status: HttpStatusMessage.SUCCESS , data: {room:room} });
    }

    @Get("/user/username")
    @HttpCode(HttpStatus.OK) 
    @UseGuards(AdminGurad)
    async getRoomsByUsername(@Query("limit") limit:number , @Query("page") page:number, @Query("creatorUsername") creatorUsername:string){
        const offset = limit*(page-1);
        const {rows , count} = await this.roomService.getAllRoomsByUsername(creatorUsername, limit , offset);
        return ({status: HttpStatusMessage.SUCCESS , data: {rooms:rows , count:count} });
    }

    @Get("/user/id")
    @HttpCode(HttpStatus.OK) 
    @UseGuards(AdminGurad)
    async getRoomsByCreatorID(@Query("limit") limit:number , @Query("page") page:number, @Query("creatorID") creatorID:string){
        const offset = limit*(page-1);
        const {rows , count} = await this.roomService.getAllRoomsByCreatorID(creatorID, limit , offset);
        return ({status: HttpStatusMessage.SUCCESS , data: {rooms:rows , count:count} });
    }

    @Get("/topic")
    @HttpCode(HttpStatus.OK) 
    @UseGuards(AdminGurad)
    async getRoomsByTopic(@Query("limit") limit:number , @Query("page") page:number, @Query("topic") topic:string){
        const offset = limit*(page-1);
        const {rows , count} = await this.roomService.getAllRoomsByTopic(topic, limit , offset);
        return ({status: HttpStatusMessage.SUCCESS , data: {rooms:rows , count:count} });
    }

}
