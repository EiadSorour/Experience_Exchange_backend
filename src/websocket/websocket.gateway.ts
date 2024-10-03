import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { SocketGuard } from "src/guards/socket.guard";
import * as mediasoup from "mediasoup";
import {
    types,
    version,
    observer,
    createWorker,
    getSupportedRtpCapabilities,
    parseScalabilityMode
} from "mediasoup";
import { WebsocketService } from "./websocket.service";

var availableRooms = {};
var inRoomUsers = {};
var waitingUsers = {};

@UseGuards(SocketGuard)
@WebSocketGateway(80, {
    namespace: "/rooms",
    cors: {
        credentials: true,
        origin: process.env.FRONT_ORIGIN,
        methods: ["GET", "POST", "DELETE", "PATCH", "UPDATE"]
    }
})

export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private readonly webSocketService:WebsocketService
    ){}

    @WebSocketServer()
    server: Server

    private worker: mediasoup.types.Worker; 

    async onModuleInit() {
        this.worker = await mediasoup.createWorker({
            rtcMinPort: 40000,
            rtcMaxPort: 41999
        }); 
    } 

    afterInit(server: Server) {
    }

    handleConnection(client: Socket) {
        client.emit("getUsername"); 
        console.log(`Client ${client.id} is connected`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client ${client.id} is disconnected`);
    }

    @SubscribeMessage("getAllRooms")
    async getAllRooms(@ConnectedSocket() client: Socket) {
        client.emit("ReceivedRooms", availableRooms);
    }

    @SubscribeMessage("getTopic")
    async getRoomsByTopic(@MessageBody() topic: string, @ConnectedSocket() client: Socket) {
        const rooms = {};
        for (let key in availableRooms) {
            if (availableRooms[key].topic.toLowerCase().includes(topic.toLowerCase())) {
                rooms[key] = availableRooms[key];
            }
        }
        client.emit("ReceivedRooms", rooms);
    }

    @SubscribeMessage("createRoom")
    async createRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { topic, creatorUsername, creatorProf } = body;

        const newRouter:types.Router = await this.worker.createRouter({
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {},
                },
            ],
        });

        availableRooms = {
            [newRouter.id]: {
                topic: topic,
                creatorProf: creatorProf,
                creatorUsername: creatorUsername,
                router: newRouter,
                transports: {}
            },
            ...availableRooms,
        }

        // Save room to database
        await this.webSocketService.saveNewRoom( newRouter.id , topic , creatorUsername);

        client.broadcast.emit("ReceivedRooms" , availableRooms);

        client.emit("gotRoomID" , {roomID: newRouter.id});
    }

    @SubscribeMessage("createProducerTransport")
    async createProducerTransport(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { roomID, username } = body;

        if(!availableRooms[`${roomID}`]){
            client.emit("roomEnded");
            return;
        }

        if(username !== availableRooms[`${roomID}`].creatorUsername){
            if(!waitingUsers[`${roomID}`] || !waitingUsers[`${roomID}`][`${username}`] || !waitingUsers[`${roomID}`][`${username}`]['accepted']){
                client.emit("mustWait");
                return;
            }
        }

        client.join(`${roomID}`);
        
        this.server.to(`${roomID}`).emit("newMember" , {username: username, id: client.id});

        const transport = await availableRooms[`${roomID}`].router.createWebRtcTransport({
            listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        });


        availableRooms[`${roomID}`].transports[`${username}`] = {
            producers: {}, 
            consumers: {}, 
        };
        
        availableRooms[`${roomID}`].transports[`${username}`].producerTransport = transport;

        availableRooms[`${roomID}`].transports[`${username}`].producerTransport.on("icestatechange", (iceState) =>{
            if(iceState === "disconnected"){
                delete waitingUsers[`${roomID}`][`${username}`]; 
                delete inRoomUsers[`${roomID}`][`${username}`];
                delete availableRooms[`${roomID}`].transports[`${username}`];
                this.server.to(`${roomID}`).emit("producerDisconnected", {producerUsername: username});
            } 
        });

        client.emit("producerTransportCreated", {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            rtpCapabilities: availableRooms[`${roomID}`].router.rtpCapabilities,
            roomID: roomID
        });

        // Save user to room
        await this.webSocketService.addUserToRoom(username , roomID);
    }

    @SubscribeMessage("connectProducerTransport")
    async connectProducerTransport(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const {dtlsParameters , roomID, username} = body;
        const transport = availableRooms[`${roomID}`].transports[`${username}`].producerTransport;

        await transport.connect({ dtlsParameters });
    }

    @SubscribeMessage("produce")
    async produce(@MessageBody() body: any, @ConnectedSocket() client: Socket) {

        const {roomID, username, kind, rtpParameters} = body;

        const transport = availableRooms[`${roomID}`].transports[`${username}`].producerTransport;
        const producer = await transport.produce({ kind, rtpParameters });

        // Store producer by clientId-kind (audio/video)
        availableRooms[`${roomID}`].transports[`${username}`].producers[`${kind}`] = producer;

        client.broadcast.to(`${roomID}`).emit("newProducer", {
            username: username,
            producerID: producer.id,
            kind: kind
        })
    }

    @SubscribeMessage("createConsumerTransport")
    async createConsumerTransport(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { roomID, username } = body;

        if(!availableRooms[`${roomID}`]){
            client.emit("roomEnded");
            return;
        }

        const transport = await availableRooms[`${roomID}`].router.createWebRtcTransport({
            listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        });

        availableRooms[`${roomID}`].transports[`${username}`].receiverTransport = transport;

        client.emit("receiverTransportCreated", {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            rtpCapabilities: availableRooms[`${roomID}`].router.rtpCapabilities,
            roomID: roomID
        });

    }

    @SubscribeMessage("connectConsumerTransport")
    async connectConsumerTransport(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { dtlsParameters , roomID, username } = body;
        
        const transport = availableRooms[`${roomID}`].transports[`${username}`].receiverTransport;
        await transport.connect({ dtlsParameters });
        
    }

    @SubscribeMessage("createConsumer")
    async createConsumer(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { username,roomID,producerUsername,rtpCapabilities,kind,producerID } = body;

        const producer = availableRooms[`${roomID}`].transports[`${producerUsername}`].producers[`${kind}`];
        const transport = availableRooms[`${roomID}`].transports[`${username}`].receiverTransport;

        if (!producer || !availableRooms[`${roomID}`].router.canConsume({ producerId: producerID, rtpCapabilities:rtpCapabilities })) {
            return;
        }

        const consumer = await transport.consume({
            producerId: producer.id,
            rtpCapabilities:rtpCapabilities,
            paused: false,
        });

        availableRooms[`${roomID}`].transports[`${username}`].consumers[`${producerUsername}-${kind}`] = consumer;

        client.emit("newConsumer", {
            consumerId: consumer.id,
            producerId: producer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            producerUsername: producerUsername,
            producerClientId: inRoomUsers[`${producerUsername}`]
        })
    }

    @SubscribeMessage("newUserJoined") 
    async newUserJoined(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { username,roomID,rtpCapabilities} = body;

        const roomTransports = availableRooms[`${roomID}`].transports;

        const transport = availableRooms[`${roomID}`].transports[`${username}`].receiverTransport;
        
        Object.keys(roomTransports).forEach((user)=>{
            
            /////////
            if(!availableRooms[`${roomID}`].transports[user].producers){
                availableRooms[`${roomID}`].transports[user].producers = {};
            }
            ////////
            
            if(username != user){

                Object.keys(availableRooms[`${roomID}`].transports[user].producers).forEach(async(kind)=>{
                    
                    const producer = availableRooms[`${roomID}`].transports[user].producers[kind];

                    if (!producer || !availableRooms[`${roomID}`].router.canConsume({ producerId: producer.id, rtpCapabilities:rtpCapabilities })) {
                        return;
                    }
            
                    const consumer = await transport.consume({
                        producerId: producer.id,
                        rtpCapabilities:rtpCapabilities,
                        paused: false,
                    });
            
                    availableRooms[`${roomID}`].transports[`${username}`].consumers[`${user}-${kind}`] = consumer;
            
                    client.emit("newConsumer", { 
                        consumerId: consumer.id,
                        producerId: producer.id,
                        kind: consumer.kind,
                        rtpParameters: consumer.rtpParameters,
                        producerUsername: user, 
                    })
                })
            }
        })
    }

    @SubscribeMessage("getRoomData")
    async videoMute(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { roomID } = body;

        if(availableRooms[`${roomID}`]){
            const room = availableRooms[`${roomID}`];

            const roomMembers = inRoomUsers[`${roomID}`];

            client.emit("gotRoomData", {topic: room.topic , creatorUsername: room.creatorUsername , roomMembers});
        } 
    }

    @SubscribeMessage("endRoom")
    async endRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { roomID } = body;

        delete inRoomUsers[`${roomID}`];
        delete availableRooms[`${roomID}`];

        client.broadcast.emit("ReceivedRooms" , availableRooms);
        client.to(`${roomID}`).emit("roomEnded");
    }

    @SubscribeMessage("kickClient")
    async kickClient(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { usernameToKick, roomID ,  clientId } = body;
        this.server.to(clientId).emit("userKicked");
    }

    @SubscribeMessage("gotUsername")
    async gotUsername(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { username, roomID } = body;
        
        if(!inRoomUsers[`${roomID}`]){
            inRoomUsers[`${roomID}`] = {}
        }


        inRoomUsers[`${roomID}`][`${username}`] = client.id;
    }

    @SubscribeMessage("userWaiting")
    async userWaiting(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { username, roomID } = body;

        if(!waitingUsers[`${roomID}`]){
            waitingUsers[`${roomID}`] = {};
        }

        if(!waitingUsers[`${roomID}`][`${username}`]){
            waitingUsers[`${roomID}`][`${username}`] = {};
        }

        waitingUsers[`${roomID}`][`${username}`]['id'] = client.id;
        waitingUsers[`${roomID}`][`${username}`]['accepted'] = false;

        client.to(roomID).emit("gotUsersWaiting", waitingUsers[`${roomID}`]);
    }

    @SubscribeMessage("rejectUser")
    async rejectUser(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { roomID, rejectedUsername , rejectedId } = body;

        delete waitingUsers[`${roomID}`][`${rejectedUsername}`];

        this.server.to(rejectedId).emit("rejected");

        client.to(`${roomID}`).emit("gotUsersWaiting", waitingUsers[`${roomID}`]);
    }

    @SubscribeMessage("acceptUser")
    async acceptUser(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { roomID, acceptedUsername , acceptedId } = body;

        waitingUsers[`${roomID}`][`${acceptedUsername}`]['accepted'] = true;

        this.server.to(acceptedId).emit("accepted");

        client.to(`${roomID}`).emit("gotUsersWaiting", waitingUsers[`${roomID}`]);
    }

    @SubscribeMessage("cancelWaiting")
    async cancelWaiting(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const { roomID, username} = body;

        delete waitingUsers[`${roomID}`][`${username}`];

        client.to(`${roomID}`).emit("gotUsersWaiting", waitingUsers[`${roomID}`]);
    }




    @SubscribeMessage("test")
    async test(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const {roomID, username} = body;

        // console.log(availableRooms[`${roomID}`].transports[`${username}`].producerTransport.iceState);
        console.log(inRoomUsers);
        console.log(client.id);
        
        
        // client.emit("test", {room: availableRooms[`${body.roomID}`]});
    }
    
}