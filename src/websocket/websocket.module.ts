import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway";
import { WebsocketService } from "./websocket.service";

@Module({
    imports: [],
    controllers: [],
    providers: [WebsocketGateway , WebsocketService],
    exports: []
})
export class WebsocketModule{}