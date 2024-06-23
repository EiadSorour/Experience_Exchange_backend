import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class UserRegisterDto{
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    profession: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsIn(["client" , "admin"] as any)
    @IsNotEmpty()
    role: string;
}