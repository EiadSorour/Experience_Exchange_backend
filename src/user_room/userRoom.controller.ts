import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { UserRoomService } from "./userRoom.service";
import { AdminGurad } from "src/guards/admin.guard";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";

@Controller("/api/user-rooms")
export class UserRoomController{
    constructor(private readonly userRoomService:UserRoomService){}

    @Get("/")
    @HttpCode(HttpStatus.OK) 
    @UseGuards(AdminGurad)
    async getAllRoomUsers(@Query("roomID") roomID:string){
        const users = await this.userRoomService.getAllRoomUsers(roomID);
        return ({status: HttpStatusMessage.SUCCESS , data: {users} });
    }
}