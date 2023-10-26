import _ from "lodash";
import { AST, Create } from "node-sql-parser";
import { EGeneratedApisTableColumns } from "../pgsql/app.core.domain.pg-script";

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
      } else {
        const api = this.mapASTToAPI(appId, secretKey, tableInfo as Create);
        apis.push(api.insert);
        apis.push(api.update);
        apis.push(api.delete);
        apis.push(api.query);
      }
    } catch (error) {
      console.log('NEED TO HANDLE FORIENCE KEY EXTRACT API');
    }

    return apis;
  }

  mapASTToAPI = (appId: number, secretKey: string, _info: Create) => {
    const query = this.getApiConfig(appId, _info, RestFulMethod.GET, secretKey);
    const insert = this.getApiConfig(appId, _info, RestFulMethod.POST, secretKey);
    const update = this.getApiConfig(appId, _info, RestFulMethod.PUT, secretKey);
    const _delete = this.getApiConfig(appId, _info, RestFulMethod.DELETE, secretKey);

    return {
      insert: insert,
      update: update,
      delete: _delete,
      query: query
    };
  }

  getApiConfig = (appId: number, _info: Create, typeApi: RestFulMethod, secretKey: string) => {
    const apiRecord = {};

    const requestBody = {};
    _info?.create_definitions?.forEach(item => {
      if (item.column) {
        const columnName = item?.column?.column;
        requestBody[columnName] = 'your_data';
      }
    });

    const tableName = (_info?.table[0]?.table as string).toLocaleLowerCase() ?? '';
    const apiPath = `/api/v1/app/${appId}/schema/${tableName}`;

    apiRecord[EGeneratedApisTableColumns.APP_ID] = appId;
    apiRecord[EGeneratedApisTableColumns.TABLE_NAME] = tableName;
    apiRecord[EGeneratedApisTableColumns.HEADERS] = JSON.stringify({
      AppClientSecretKey: secretKey
    });
    apiRecord[EGeneratedApisTableColumns.AUTHENTICATION] = Authenticate.NO_AUTH;

    apiRecord[EGeneratedApisTableColumns.ENABLE] = true;
    apiRecord[EGeneratedApisTableColumns.CREATED_AT] = new Date();
    apiRecord[EGeneratedApisTableColumns.UPDATED_AT] = new Date();
    apiRecord[EGeneratedApisTableColumns.REQUEST_BODY] = JSON.stringify({});
    apiRecord[EGeneratedApisTableColumns.RESPONSE_ATTRIBUTES] = JSON.stringify({});

    switch (typeApi) {
      case RestFulMethod.GET:
        apiRecord[EGeneratedApisTableColumns.API_PATH] = apiPath;
        apiRecord[EGeneratedApisTableColumns.HTTP_METHOD] = RestFulMethod.GET;
        apiRecord[EGeneratedApisTableColumns.ACTION] = ApiAction.QUERY;


        break;
      case RestFulMethod.POST:
        apiRecord[EGeneratedApisTableColumns.API_PATH] = apiPath;
        apiRecord[EGeneratedApisTableColumns.HTTP_METHOD] = RestFulMethod.POST;
        apiRecord[EGeneratedApisTableColumns.ACTION] = ApiAction.INSERT;
        apiRecord[EGeneratedApisTableColumns.REQUEST_BODY] = JSON.stringify([requestBody]);
        apiRecord[EGeneratedApisTableColumns.RESPONSE_ATTRIBUTES] = JSON.stringify([requestBody]);

        break;
      case RestFulMethod.PUT:
        apiRecord[EGeneratedApisTableColumns.API_PATH] = `${apiPath}/:id`;
        apiRecord[EGeneratedApisTableColumns.HTTP_METHOD] = RestFulMethod.PUT;
        apiRecord[EGeneratedApisTableColumns.ACTION] = ApiAction.UPDATE;
        apiRecord[EGeneratedApisTableColumns.REQUEST_BODY] = JSON.stringify([requestBody]);
        apiRecord[EGeneratedApisTableColumns.RESPONSE_ATTRIBUTES] = JSON.stringify([requestBody]);

        break;
      case RestFulMethod.DELETE:
        apiRecord[EGeneratedApisTableColumns.API_PATH] = `${apiPath}/:id`;
        apiRecord[EGeneratedApisTableColumns.HTTP_METHOD] = RestFulMethod.DELETE;
        apiRecord[EGeneratedApisTableColumns.ACTION] = ApiAction.DELETE;
        break;
    }
    return apiRecord;
  }
}