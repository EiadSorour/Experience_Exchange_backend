import { HttpException } from "@nestjs/common";
import { HttpStatusMessage } from "./httpStatusMessage.enum";

export class AppError extends HttpException {
    constructor(message:string , status:HttpStatusMessage , statusCode:number) {
        super({
            message: message,
            status: status,
            statusCode: statusCode
        } , statusCode);
    }
}