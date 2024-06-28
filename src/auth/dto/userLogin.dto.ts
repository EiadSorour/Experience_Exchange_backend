import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserLoginDto{
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        type: String,
    })
    username: string;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        type: String,
    })
    password: string
}