export class DbQueryDomain {
  getTableName(appId: string, tableName: string) {
    return `public.app_id_${appId}_schema_${tableName}`
  }

  getCachingTableInfo = (tableName: string) => {
    return `table_info_cache_${tableName}`;
  }

  getTableColumnNameArray = (tableInfo: object[], property: string): string[] => {
    return tableInfo.map(item => item[property]);
  };
}