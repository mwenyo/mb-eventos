import { inject, injectable } from 'inversify';
import { Not } from 'typeorm';

import TYPES from '../utilities/types';
import BusinessError, { ErrorCodes, ValidationErrorCodes } from '../utilities/errors/business';

import UserEntity from '../db/entities/user';
import { IUserRepository } from '../db/repositories/interfaces/user';
import { IUserService } from './interfaces/user';

import { Pagination, ISearchParameterUser } from '../models/pagination';

import ProfileType from '../enumerators/profile-type';
import { hash } from 'bcrypt';
import { cnpj, cpf } from 'cpf-cnpj-validator';

@injectable()
export class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
  ) {
    this.userRepository = userRepository;
  }

  async getById(id: string): Promise<UserEntity> {
    const user: UserEntity = await this.userRepository.selectById(id);
    if (!user) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND)
    return user;
  }

  async create(newUser: UserEntity): Promise<UserEntity> {
    const existInformation = await this.userRepository.selectByWhere(
      {
        where: [
          { email: newUser.email },
          { cpfCnpj: newUser.cpfCnpj },
        ]
      }
    );
    if (existInformation.length !== 0) throw new BusinessError(ErrorCodes.USER_ALREADY_EXISTS);
    newUser = {
      ...newUser,
      ...newUser.password && { password: await hash(newUser.password, 10) },
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM',
    }
    const response = await this.userRepository.create(newUser);
    return response;
  }

  async getWithPagination(searchParameter: ISearchParameterUser):
    Promise<Pagination<UserEntity> | null> {
    const response = await this.userRepository.selectPagination(searchParameter);
    return response;
  }

  async updateById(user: UserEntity, actor: UserEntity): Promise<UserEntity> {

    const existUser = await this.userRepository.selectById(user.id);
    if (!existUser) throw new BusinessError(ErrorCodes.USER_NOT_FOUND);
    if ((actor.id !== existUser.id) && (actor.profileType !== ProfileType.ADMIN)) throw new BusinessError(ErrorCodes.USER_BLOCKED);
    const existInformation = await this.userRepository.selectByWhere(
      {
        where: [
          {
            email: user.email,
            id: Not(user.id)
          },
          {
            cpfCnpj: user.cpfCnpj,
            id: Not(user.id)
          },
        ]
      }
    );
    if (existInformation.length !== 0) throw new BusinessError(ErrorCodes.USER_ALREADY_EXISTS);
    if (user.cpfCnpj) {
      if (existUser.profileType === ProfileType.PARTICIPANT && !cpf.isValid(user.cpfCnpj)) {
        throw new BusinessError(ValidationErrorCodes.INVALID_CPF);
      }
      if (existUser.profileType === ProfileType.PROMOTER && !cnpj.isValid(user.cpfCnpj)) {
        throw new BusinessError(ValidationErrorCodes.INVALID_CNPJ);
      }
    }
    const userToUpdate: UserEntity = {
      ...user.name !== undefined && { name: user.name },
      ...user.address !== undefined && { address: user.address },
      ...user.cpfCnpj !== undefined && { cpfCnpj: user.cpfCnpj },
      ...user.email !== undefined && { email: user.email },
      updatedBy: actor.id ? actor.id : 'SYSTEM',
    }
    await this.userRepository.updateById(user.id as string, userToUpdate);
    const updatedUser = await this.userRepository.selectById(existUser.id);
    return updatedUser;
  }

  async deleteById(id: string, actor: UserEntity): Promise<boolean> {

    const existUser = await this.userRepository.selectById(id);
    if (!existUser) throw new BusinessError(ErrorCodes.USER_NOT_FOUND);
    if ((actor.id !== existUser.id) && (actor.profileType !== ProfileType.ADMIN))
      await this.userRepository.updateById(id, {
        deletedAt: new Date(),
        deletedBy: actor.id ? actor.id : 'SYSTEM',
      });
    await this.userRepository.deleteById(id);
    return true;
  }
}
