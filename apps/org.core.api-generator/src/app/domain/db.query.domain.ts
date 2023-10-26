
export enum AvailableDB {
  PG = 'postgres',
  MYSQL = 'mysql',
  MSSQL = 'mssql',
  ORACLE = 'oracle',
}
export class DbQueryDomain {
  getTableName(appId: string, tableName: string) {
    return `app_${appId}_${tableName}`
  }

  getCachingTableInfo = (app_id: string, tableName: string) => {
    return `table_info_cache_app_${app_id}_table_${tableName}`;
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



}