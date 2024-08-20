import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { SocketGuard } from "src/guards/socket.guard";

var availableRooms = [
    {
        topic: "art",
        creatorUsername: "eiad sorour",
        creatorProf: "ai engineer",
        offer: "",
        offerIce: [],
        answer: "",
        answerIce: []
    },
    {
        topic: "learning",
        creatorUsername: "Amir ahmed",
        creatorProf: "doctor",
        offer: "",
        offerIce: [],
        answer: "",
        answerIce: []
    },
    {
        topic: "sports",
        creatorUsername: "Amir ahmed",
        creatorProf: "doctor",
        offer: "",
        offerIce: [],
        answer: "",
        answerIce: []
    },
    {
        topic: "engineering",
        creatorUsername: "Amir ahmed",
        creatorProf: "doctor",
        offer: "",
        offerIce: [],
        answer: "",
        answerIce: []
    },
    {
        topic: "computer science",
        creatorUsername: "Amir ahmed",
        creatorProf: "doctor",
        offer: "",
        offerIce: [],
        answer: "",
        answerIce: []
    },
    {
        topic: "cartoon",
        creatorUsername: "Amir ahmed",
        creatorProf: "doctor",
        offer: "",
        offerIce: [],
        answer: "",
        answerIce: []
    },
    {
        topic: "teaching",
        creatorUsername: "Amir ahmed",
        creatorProf: "doctor",
        offer: "",
        offerIce: [],
        answer: "",
        answerIce: []
    },
    {
        topic: "books",
        creatorUsername: "Amir ahmed",
        creatorProf: "doctor",
        offer: "",
        offerIce: [],
        answer: "",
        answerIce: []
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

    @SubscribeMessage("new_offer")
    async createOffer(@MessageBody() newOffer:any , @ConnectedSocket() client: Socket){
        const {offer , topic , creatorUsername, creatorProf} = newOffer;
        availableRooms.unshift({
            topic: topic,
            creatorUsername: creatorUsername,
            creatorProf: creatorProf,
            offer: offer,
            offerIce: [],
            answer: "",
            answerIce: []  
        });
        client.broadcast.emit("ReceivedRooms" , availableRooms);  
    } 
    
    @SubscribeMessage("send_ice_candidate_to_server")
    async setIceCandidates(@MessageBody() body , @ConnectedSocket() client: Socket){
        const {isOffer , candidate , creatorUsername} = body;
        if(isOffer){
            availableRooms.find((offer)=>offer.creatorUsername == creatorUsername).offerIce.push(candidate);
        }else{
            // handle answer candidates
        }
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