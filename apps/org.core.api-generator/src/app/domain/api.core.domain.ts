import _ from "lodash";
import { AST, Create } from "node-sql-parser";
import { EGeneratedApisTableColumns } from "./app.core.domain.script";

export enum ApiAction {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  QUERY = 'QUERY'
}

export enum RestFulMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum Authenticate {
  NO_AUTH = 'NO_AUTH',
  NEED_AUTH = 'NEED_AUTH',
}

export class ApisCoreDomain {
  extractApisFromTableInfo = (appId: number, secretKey: string, tableInfo: AST | AST[]): object[] => {
    const apis: object[] = [];

    try {
      if (_.isArray(tableInfo)) {
        _.forEach(tableInfo, (_info: Create) => {
          const api = this.mapASTToAPI(appId, secretKey, _info)
          apis.push(api.insert);
          apis.push(api.update);
          apis.push(api.delete);
          apis.push(api.query);
        });
        return apis;
      }
      const api = this.mapASTToAPI(appId, secretKey, tableInfo as Create);
      apis.push(api.insert);
      apis.push(api.update);
      apis.push(api.delete);
      apis.push(api.query);
    } catch (error) {
      console.log('This is forence key');
    }

    return apis;
  }

  mapASTToAPI = (appId: number, secretKey: string, _info: Create) => {
    const requestBody = {};
    _info?.create_definitions?.forEach(item => {
      if (item.column) {
        const columnName = item?.column?.column;
        requestBody[columnName] = 'Điền dữ liệu của bạn tại đây';
      }
    });
    const insert = {
      [EGeneratedApisTableColumns.APP_ID]: appId,
      [EGeneratedApisTableColumns.TABLE_NAME]: _info?.table[0]?.table,
      [EGeneratedApisTableColumns.ACTION]: ApiAction.INSERT,
      [EGeneratedApisTableColumns.API_PATH]: `/api/v1/app/${appId}/schema/${_info?.table[0]?.table}`,
      [EGeneratedApisTableColumns.HTTP_METHOD]: RestFulMethod.POST,
      [EGeneratedApisTableColumns.AUTHENTICATION]: Authenticate.NO_AUTH,
      [EGeneratedApisTableColumns.HEADERS]: JSON.stringify({
        AppClientSecretKey: secretKey
      }),
      [EGeneratedApisTableColumns.REQUEST_BODY]: JSON.stringify([requestBody]),
      [EGeneratedApisTableColumns.RESPONSE_ATTRIBUTES]: JSON.stringify([requestBody]),

      [EGeneratedApisTableColumns.ENABLE]: true,
      [EGeneratedApisTableColumns.CREATED_AT]: new Date(),
      [EGeneratedApisTableColumns.UPDATED_AT]: new Date(),
    };

    const update = {
      [EGeneratedApisTableColumns.APP_ID]: appId,
      [EGeneratedApisTableColumns.TABLE_NAME]: _info?.table[0]?.table,
      [EGeneratedApisTableColumns.ACTION]: ApiAction.UPDATE,
      [EGeneratedApisTableColumns.API_PATH]: `/api/v1/app/${appId}/schema/${_info?.table[0]?.table}/:id`,
      [EGeneratedApisTableColumns.HTTP_METHOD]: RestFulMethod.PUT,
      [EGeneratedApisTableColumns.AUTHENTICATION]: Authenticate.NO_AUTH,
      [EGeneratedApisTableColumns.HEADERS]: JSON.stringify({
        AppClientSecretKey: secretKey
      }),
      [EGeneratedApisTableColumns.REQUEST_BODY]: JSON.stringify([requestBody]),
      [EGeneratedApisTableColumns.RESPONSE_ATTRIBUTES]: JSON.stringify([requestBody]),

      [EGeneratedApisTableColumns.ENABLE]: true,
      [EGeneratedApisTableColumns.CREATED_AT]: new Date(),
      [EGeneratedApisTableColumns.UPDATED_AT]: new Date(),
    };

    const _delete = {
      [EGeneratedApisTableColumns.APP_ID]: appId,
      [EGeneratedApisTableColumns.TABLE_NAME]: _info?.table[0]?.table,
      [EGeneratedApisTableColumns.ACTION]: ApiAction.DELETE,
      [EGeneratedApisTableColumns.API_PATH]: `/api/v1/app/${appId}/schema/${_info?.table[0]?.table}/:id`,
      [EGeneratedApisTableColumns.HTTP_METHOD]: RestFulMethod.DELETE,
      [EGeneratedApisTableColumns.AUTHENTICATION]: Authenticate.NO_AUTH,
      [EGeneratedApisTableColumns.HEADERS]: JSON.stringify({
        AppClientSecretKey: secretKey
      }),
      [EGeneratedApisTableColumns.REQUEST_BODY]: JSON.stringify({}),
      [EGeneratedApisTableColumns.RESPONSE_ATTRIBUTES]: JSON.stringify({}),

      [EGeneratedApisTableColumns.ENABLE]: true,
      [EGeneratedApisTableColumns.CREATED_AT]: new Date(),
      [EGeneratedApisTableColumns.UPDATED_AT]: new Date(),
    };

    const query = {
      [EGeneratedApisTableColumns.APP_ID]: appId,
      [EGeneratedApisTableColumns.TABLE_NAME]: _info?.table[0]?.table,
      [EGeneratedApisTableColumns.ACTION]: ApiAction.QUERY,
      [EGeneratedApisTableColumns.API_PATH]: `/api/v1/app/${appId}/schema/${_info?.table[0]?.table}`,
      [EGeneratedApisTableColumns.HTTP_METHOD]: RestFulMethod.GET,
      [EGeneratedApisTableColumns.AUTHENTICATION]: Authenticate.NO_AUTH,
      [EGeneratedApisTableColumns.HEADERS]: JSON.stringify({
        AppClientSecretKey: secretKey
      }),
      [EGeneratedApisTableColumns.REQUEST_BODY]: JSON.stringify({}),
      [EGeneratedApisTableColumns.RESPONSE_ATTRIBUTES]: JSON.stringify({}),
      [EGeneratedApisTableColumns.ENABLE]: true,
      [EGeneratedApisTableColumns.CREATED_AT]: new Date(),
      [EGeneratedApisTableColumns.UPDATED_AT]: new Date(),
    };
    return {
      insert: insert,
      update: update,
      delete: _delete,
      query: query
    };
  }
}