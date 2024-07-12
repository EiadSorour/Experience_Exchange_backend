import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AdminGurad } from "src/guards/admin.guard";
import { User } from "./user.model";
import { HttpStatusMessage } from "src/utils/httpStatusMessage.enum";

@Controller("/api")
export class UserController{
    constructor(private readonly userService:UserService){}

    @Get("/users")
    @HttpCode(HttpStatus.OK) 
    @UseGuards(AdminGurad)
    async getAllUsers(@Query("limit") limit:number , @Query("page") page:number){
        const offset = limit*(page-1);
        const users:User[] = await this.userService.getAllUsers(limit,offset); 
        return ({status: HttpStatusMessage.SUCCESS , data: {users:users}});
    }
}