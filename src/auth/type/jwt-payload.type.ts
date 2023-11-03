import { User } from '../../user/user.entity';

export type JwtPayload = {
  username: string;
  sub: Pick<User, 'id'>;
};
