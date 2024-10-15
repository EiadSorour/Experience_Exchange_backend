import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Message } from "./message.model";

@Injectable()
export class MessageService{
    constructor(@InjectModel(Message) private readonly messageModel:typeof Message){}

    async createMessage(senderUsername:string , text:string , roomID:string): Promise<void>{
        await this.messageModel.create({senderUsername , text , roomID});
    }


}