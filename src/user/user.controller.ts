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
        const {rows , count} = await this.userService.getAllUsers(limit,offset);
        return ({status: HttpStatusMessage.SUCCESS , data: {users:rows , count:count}});
    }
    
    @Get("/users/id")
    @HttpCode(HttpStatus.OK) 
    @UseGuards(AdminGurad)
    async getUserById(@Query("id") id:string){
        const user:User = await this.userService.getUserById(id);
        return ({status: HttpStatusMessage.SUCCESS , data: {user:user} });
    }

    @Get("/users/username")
    @HttpCode(HttpStatus.OK) 
    @UseGuards(AdminGurad)
    async getUserByUsername(@Query("limit") limit:number , @Query("page") page:number, @Query("username") username:string){
        const offset = limit*(page-1);
        const {rows , count} = await this.userService.getUsersByUsername(username, limit , offset);
        return ({status: HttpStatusMessage.SUCCESS , data: {users:rows , count:count} });
    }
}