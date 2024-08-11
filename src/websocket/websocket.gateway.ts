import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

@WebSocketGateway(80 , {
    namespace:"/rooms" ,
    cors: {
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
}