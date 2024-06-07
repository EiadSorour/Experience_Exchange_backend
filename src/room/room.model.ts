import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from 'src/user/user.model';
import { UserRoom } from 'src/user_room/userRoom.model';

@Table
export class Room extends Model {
    @Column({primaryKey: true , type: DataType.UUID ,defaultValue: DataType.UUIDV4})
    roomID: string;

    @Column({unique: false , allowNull: false , type: DataType.STRING})
    topic: string;

    @Column({ allowNull: false , type: DataType.UUID})
    @ForeignKey(()=>User)
    creatorID: string;

    @BelongsTo(()=>User)
    creator: User;

    @BelongsToMany(()=>Room , { through: {model: ()=>UserRoom,  unique: true } })
    usersJoined: User[];
}