/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException, Injectable } from '@nestjs/common';
import { ConnectToServerDTO } from '../dto/connect-to-server.dto';
import { ConfigService } from '@nestjs/config';
import { CrudService } from '../../crud-pg/services/crud-pg.service';
import { WORKSPACE_VARIABLE } from '../../shared/variables/workspace.variable';

@Injectable()
export class ManageApiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly crudService: CrudService,
  ) { }


  async getAuthorizeInfoInDB() {
    const appId = WORKSPACE_VARIABLE.APP_ID.toString();
    const [roles, apis] = await Promise.all([
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
        selects: ['id', 'metadata']
      }, {})
    ]);
  }
  // Connect:
  getServerInfo(body: ConnectToServerDTO) {
    this.getAuthorizeInfoInDB();
    if (this.isValidSecetKey(body.secretKey)) {
      return true;
    }
    throw new HttpException({
      'message': 'Secretkey invalid, please auth to exec this api',
      'action': 'Auth with config mode'
    }, 401)
  }


  isValidSecetKey(key: string) {
    const serverSecretKey = this.configService.get('app.secretKey');
    return key === serverSecretKey;
  }
}
