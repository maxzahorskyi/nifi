import { Auth } from '../../auth/Auth';
import DataService from '../../config/http/DataService';
import token from '../../pages/token';
import { GQLUser } from '../../types/graphql.schema';
import { walletTypes } from '../../types/wallet';
import EncryptUtil from '../../utils/EncryptUtil';

class UserService {
  public static async createUser(createUserDto: UserCreateDto) {
    const token = (await Auth.getInstance()).getAssertedTokenByWalletAddress(
      createUserDto.walletAddress,
    );

    const RSAUtilTool = new EncryptUtil();
    return DataService.post<{ user: GQLUser }>(`/user/create/${token}`, {
      value: RSAUtilTool.encrypt(JSON.stringify(createUserDto)),
    });
  }

  public static async updateUserSettings(updateUserDto: UserUpdateDto) {
    const { walletAddress, ...body } = updateUserDto;
    const token = (await Auth.getInstance()).getAssertedTokenByWalletAddress(walletAddress);

    const RSAUtilTool = new EncryptUtil();
    return DataService.put<{ user: GQLUser }>(`/user/${walletAddress}/${token}`, {
      value: RSAUtilTool.encrypt(JSON.stringify(body)),
    });
  }
}

export default UserService;

export interface UserUpdateDto {
  nickname: string;
  username: string;
  avatarHash?: string;
  photoHash?: string;
  wallpaperHash?: string;
  about?: string;
  walletAddress: string;
  defaultWallet: walletTypes;
}

export interface UserCreateDto {
  nickname: string;
  username: string;
  avatarHash?: string;
  photoHash?: string;
  wallpaperHash?: string;
  about?: string;
  walletAddress: string;
  registeredWallet: walletTypes;
}

export interface UserDto extends UserUpdateDto {
  id: string;
  accountNumber: number;
  registeredWallet: string;
}
