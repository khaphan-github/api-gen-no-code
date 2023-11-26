/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { UserLoginDTO } from './dtos/auth.dto';
import { ConfigService } from '@nestjs/config';
import { CrudService } from '../crud-pg/services/crud-pg.service';
import { WORKSPACE_VARIABLE } from '../shared/variables/workspace.variable';
import { JwtService } from '@nestjs/jwt';
import { BCryptService } from './bscript.service';
import { WrongUsernameOrPasswordError } from './errors/login..error';
import { ITokenPayLoad, IUserLogin } from './interfaces/user-login.interface';
import { RegisterDTO } from './dtos/register.dto';
import { v4 as uuidv4 } from 'uuid';
import { IRegister } from './interfaces/register.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly crudService: CrudService,
    private readonly jwtService: JwtService,
    private readonly bscriptService: BCryptService,
  ) { }

  async login(userLoginDto: UserLoginDTO): Promise<IUserLogin> {
    const { password, username } = userLoginDto;
    const appId = WORKSPACE_VARIABLE.APP_ID.toString();

    // USER
    const userInSystem = await this.crudService.query({
      appid: appId,
      schema: '_core_account'
    }, {
      selects: ['id', 'metadata', 'username', 'password']
    }, {
      and: [
        { username: username },
      ]
    });
    const foundUser = userInSystem[0];

    if (!foundUser) {
      return Promise.reject(new WrongUsernameOrPasswordError());
    }

    const isRightPassword = await this.bscriptService.comparePassword(password, foundUser.password);

    if (!isRightPassword) {
      return Promise.reject(new WrongUsernameOrPasswordError());
    }

    // TOKEN
    const tokenPairId = uuidv4();
    const tokenPayload: ITokenPayLoad = {
      userId: foundUser?.id ?? '_',
      tokenId: tokenPairId
    }

    const accessToken = this.jwtService.sign(tokenPayload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(
      {
        ...tokenPayload,
        accessTokenId:
          tokenPairId
      },
      { expiresIn: '7d' }
    );

    const userLogin: IUserLogin = {
      info: {
        id: foundUser.id,
        metadata: foundUser.metadata,
        username: foundUser.username
      },
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
    }
    return userLogin
  }

  async register(registerDto: RegisterDTO) {
    const { username, info, password } = registerDto;
    const appId = WORKSPACE_VARIABLE.APP_ID.toString();

    const passwordHashed = await this.bscriptService.hashPassword(password);
    const workspaceConfig = await this.crudService.query({
      appid: appId,
      schema: '_core_workspace_config'
    }, {
      selects: ['id', 'genneral_config']
    }, {
      id: WORKSPACE_VARIABLE.WORKSPACE_ID.toString()
    });

    const foundWorkspace = workspaceConfig[0];
    const defaultRoleOfAccountWhenRegister = foundWorkspace.genneral_config.defaultRoleOfAccountWhenRegister;

    const saveUserResult = await this.crudService.insert(appId, '_core_account',
      [{
        username: username,
        password: passwordHashed,
        metadata: {
          info: info,
          roleIds: defaultRoleOfAccountWhenRegister
        },
        enable: true,
      }]);


    const registerResult: IRegister = {
      id: saveUserResult[0].id,
      metadata: saveUserResult[0].metadata,
      created_at: saveUserResult[0].created_at,
      username: saveUserResult[0].username,
      enable: saveUserResult[0].enable,
    }
    return registerResult;
  }

  async getAuthorizeInfoInDB() {
    const appId = WORKSPACE_VARIABLE.APP_ID.toString();
    const [roles, apis, accounts] = await Promise.all([
      this.crudService.query({
        appid: appId,
        schema: '_core_role'
      }, {} as any, {} as any),

      this.crudService.query({
        appid: appId,
        schema: '_core_generated_apis'
      }, {} as any, {} as any),

      this.crudService.query({
        appid: appId,
        schema: '_core_account'
      }, {
        selects: ['id', 'metadata'] // roleIds
      }, {})
    ]);
  }
}
