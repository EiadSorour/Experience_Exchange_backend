import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { SocketGuard } from "src/guards/socket.guard";

var availableRooms = [
    {
        topic: "art",
        creatorUsername: "eiad sorour",
        creatorProf: "ai engineer",
        connectedSockets: [],
    },
    {
        topic: "science",
        creatorUsername: "adham tarek",
        creatorProf: "doctor",
        connectedSockets: []
    },
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

    @SubscribeMessage("getTopic")
    async getRoomsByTopic(@MessageBody() topic:string , @ConnectedSocket() client: Socket){
        const rooms = availableRooms.filter((room)=>{ return room.topic.includes(topic.toLowerCase()) });
        client.emit("ReceivedRooms" , rooms);
    }

    @SubscribeMessage("roomCreated")
    async createRoom(@MessageBody() body:any , @ConnectedSocket() client: Socket){
        const {topic, creatorUsername , creatorProf} = body;
        const creatorSocket = client.id;
        availableRooms.unshift({
            topic: topic,
            creatorUsername: creatorUsername,
            creatorProf: creatorProf,
            connectedSockets: [creatorSocket]
        });

        client.broadcast.emit("ReceivedRooms" , availableRooms);
    }

    @SubscribeMessage("askToJoin")
    async askToJoin(@MessageBody() body:any , @ConnectedSocket() client: Socket){
        const {creatorUsername, clientUsername} = body;
        const wantedRoom = availableRooms.find((room)=>room.creatorUsername == creatorUsername);
        const connectedSockets = wantedRoom.connectedSockets;

        connectedSockets.forEach((socket)=>{
            this.server.to(socket).emit("newUserJoin", {
                clientUsername: clientUsername,
                userSocket: client.id
            });
        })
    }

    @SubscribeMessage("sendCandidateToServer")
    async sendCandidate(@MessageBody() body:any , @ConnectedSocket() client: Socket){
        const { candidate, isOffer, toSocket, fromUser } = body;
        if(isOffer){
            this.server.to(toSocket).emit("offerIceRecieved", {candidate ,fromUser});
        }else{
            this.server.to(toSocket).emit("answerIceRecieved" , {candidate, fromUser});
        }
    }

    @SubscribeMessage("joinAccepted")
    async joinAccepted(@MessageBody() body:any , @ConnectedSocket() client: Socket){
        const {offer,toSocket,clientUsername} = body;

        this.server.to(toSocket).emit("getAnswer", {
            offer: offer,
            fromSocket: client.id,
            fromClientUsername: clientUsername
        });
    }

    @SubscribeMessage("sendAnswer")
    async sendAnswer(@MessageBody() body:any , @ConnectedSocket() client: Socket){
        
        const {answer,toSocket,creatorUsername,clientUsername} = body;
        
        const room = availableRooms.find((room)=>room.creatorUsername == creatorUsername);
        if(!room.connectedSockets.includes(client.id)){
            room.connectedSockets.push(client.id);
            console.log(room.connectedSockets);
        }

        this.server.to(toSocket).emit("answerRecieved", {
            answer,
            clientUsername
        });
    }
}