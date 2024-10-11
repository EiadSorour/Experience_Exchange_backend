import { Model, Column, Table, ForeignKey, BelongsTo, DataType } from "sequelize-typescript";
import { Room } from "src/room/room.model";
import { User } from "src/user/user.model";

@Table
export class Message extends Model{

    @Column({primaryKey: true , type: DataType.UUID ,defaultValue: DataType.UUIDV4})
    messageID: string;

    @Column({allowNull: false , type: DataType.STRING})
    @ForeignKey(()=>User)
    senderUsername: string;

    @Column({allowNull: false , type: DataType.STRING})
    text: string

    @Column({allowNull: false , type: DataType.UUID})
    @ForeignKey(()=>Room)
    roomID: number;

    @BelongsTo(()=>Room)
    chatOfMessage: Room
}