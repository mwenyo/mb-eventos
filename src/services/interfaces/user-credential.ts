import UserEntity from '../../db/entities/user';
import { IAccessTokenAndRefreshToken } from '../../models/user-credential';
import { AdditionalInformation } from '../../models/user';

export interface IUserCredentialService {
  authenticate(email: string, pin: string): Promise<IAccessTokenAndRefreshToken>;
  refeshToken(token: string): Promise<string>;
}
