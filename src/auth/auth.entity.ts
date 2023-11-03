import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  refreshToken: string;

  @Column()
  expireDate: string;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;
}
