import UserEntity from '../../db/entities/user';
import { IAccessTokenAndRefreshToken } from '../../models/user-credential';


export interface IUserCredentialService {
  authenticate(email: string, pin: string): Promise<IAccessTokenAndRefreshToken>;
  refeshToken(token: string): Promise<string>;
}
