import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { SocketGuard } from "src/guards/socket.guard";

var availableRooms = [
    // {
    //     topic: "art",
    //     creatorUsername: "eiad sorour",
    //     creatorProf: "ai engineer"
    // },
    // {
    //     topic: "Learning",
    //     creatorUsername: "Amir ahmed",
    //     creatorProf: "doctor"
    // },
];

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

    @SubscribeMessage("getAllRooms")
    async getAllRooms(@ConnectedSocket() client: Socket){
        client.emit("ReceivedRooms" , availableRooms);
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