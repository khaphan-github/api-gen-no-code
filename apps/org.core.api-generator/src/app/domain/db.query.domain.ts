import { ClientConfig } from "pg";

export type AppConfigDomain = {
  appName: string;
  database: string;
  databaseName: string;
  host: string;
  password: string;
  port: 5432,
  username: string;
}

export enum AvailableDB {
  PG = 'postgres',
  MYSQL = 'mysql',
  MSSQL = 'mssql',
  ORACLE = 'oracle',
}
export class DbQueryDomain {
  getTableName(appId: string, tableName: string) {
    return `public.app_id_${appId}_schema_${tableName}`
  }

  getCachingTableInfo = (tableName: string) => {
    return `table_info_cache_${tableName}`;
  }

  getCahingAppConfig = (appId: string | number) => {
    return `app_config_cache_${appId}`;
  }

  getTableColumnNameArray = (tableInfo: object[], property: string): string[] => {
    return tableInfo.map(item => item[property]);
  };

  getAppConfigJsonFileName = (appId: string | number) => {
    return `user.config.db/app_${appId}.config.json`;
  }


  getPGDbConfig = (appConfig: AppConfigDomain): ClientConfig => {
    const pgConfig: ClientConfig = {
      host: appConfig.host,
      port: appConfig.port,
      user: appConfig.username,
      password: appConfig.password,
      database: appConfig.databaseName
    }
    return pgConfig;
  }
}