import UserEntity from "../../db/entities/user";
import { UserDTO } from "../../models/user";

export function userMapToEntity(user: UserDTO): UserEntity {
  return {
    name: user.name,
    cpfCpnj: user.cpfCnpj,
    adress: user.adress,
    email: user.email,
    password: user.password,
    profileType: user.profileType,
  };
}

export function userMapToDTO(user: UserEntity): UserDTO {
  return {
    id: user.id,
    name: user.name,
    cpfCnpj: user.cpfCpnj,
    adress: user.adress,
    email: user.email,
    profileType: user.profileType,
  };
}
