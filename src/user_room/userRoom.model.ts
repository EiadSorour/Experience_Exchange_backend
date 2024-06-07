import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Room } from 'src/room/room.model';
import { User } from 'src/user/user.model';

@Table
export class UserRoom extends Model {
    @Column({primaryKey: true , type: DataType.UUID ,defaultValue: DataType.UUIDV4})
    userRoomID: string;

    @Column({type: DataType.UUID})
    @ForeignKey(()=>User)
    userID: String;

    @Column({type: DataType.UUID})
    @ForeignKey(()=>Room)
    roomID: String;
}