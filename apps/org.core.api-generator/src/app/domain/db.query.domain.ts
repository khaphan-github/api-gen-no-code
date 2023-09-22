export class DbQueryDomain {
  getTableName(appId: string, schema: string) {
    return `public.app_id_${appId}_schema_${schema}`;
  }
}