import { UseGuards } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { SocketGuard } from "src/guards/socket.guard";

@UseGuards(SocketGuard) 
@WebSocketGateway(80 , {
    namespace:"/rooms" ,
    cors: {
        credentials: true,
        origin: process.env.FRONT_ORIGIN,
        methods: ["GET", "POST" , "DELETE" , "PATCH" , "UPDATE"]
    }
})

export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer()
    server: Server

    afterInit(server:Server){ 
    }

    handleConnection(client:Socket) {  
        console.log(`Client ${client.id} is connected`); 
    }

    handleDisconnect(client:Socket) {
    }

    // @SubscribeMessage("sendMessage")
    // async handleNewMessage(@MessageBody() messageBody:SendMessageDto , @ConnectedSocket() client: Socket){
    //     const chatID = String(messageBody.chatID);
    //     const messageText = messageBody.message;
    //     const username = client.data.payload.username;
    //     const message = {
    //         senderUsername: username,
    //         text: messageText,
    //         chatID: chatID
    //     }
    //     await this.eventsService.saveMessage(message as any);
    //     client.to(chatID).emit("newMessage" , messageText);
    // }
}