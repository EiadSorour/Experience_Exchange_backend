import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserRegisterDto{
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
    profession: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        type: String,
    })
    password: string

    @ApiProperty({
        readOnly: true,
        required: false,
        enum: ["admin", "client"]
    })
    role: string;
}