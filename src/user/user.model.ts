import { BelongsToMany, Column, DataType, DeletedAt, HasMany, Model, Table } from 'sequelize-typescript';
import { Room } from 'src/room/room.model';
import { UserRoom } from 'src/user_room/userRoom.model';

@Table
export class User extends Model {
    @Column({primaryKey: true , type: DataType.UUID ,defaultValue: DataType.UUIDV4})
    userID: string;

    @Column({unique: true , allowNull: false , type: DataType.STRING})
    username: string;

    @Column({ allowNull: false , type: DataType.STRING})
    password: string;

    @Column({ allowNull: false , type: DataType.STRING})
    profession: string;

    @Column({ allowNull: false , type: DataType.STRING ,values: ["client" , "admin"] })
    role: string;
    
    @Column({ allowNull: false , type: DataType.BOOLEAN, defaultValue: false })  
    isBlocked: boolean;

    @HasMany(()=>Room)
    createdRooms: Room[];

    @BelongsToMany(()=>Room , { through: {model: ()=>UserRoom,  unique: false } })
    attenedRooms: Room[];

    @DeletedAt
    deletedAt: any;

    paranoid:true;
    timestamps:true;
}