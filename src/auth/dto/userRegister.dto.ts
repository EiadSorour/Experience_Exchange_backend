import { IsEmpty, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

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

    role: string;
}