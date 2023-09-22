
export interface ConditionObject {
  and?: ConditionObject[];
  or?: ConditionObject[];
  [key: string]: string | ConditionObject[] | undefined;
}

export class DbQueryDomain {
  getTableName(appId: string, schema: string) {
    return `public.app_id_${appId}_schema_${schema}`;
  }

  // Param can put outsize;
  generateConditionQuery(conditionObject: ConditionObject, params: unknown[]): string {
    if ('and' in conditionObject) {
      const andConditions = conditionObject.and?.map((condition) => this.generateConditionQuery(condition, params));
      return `(${andConditions.join(' AND ')})`;
    } else if ('or' in conditionObject) {
      const orConditions = conditionObject.or?.map((condition) => this.generateConditionQuery(condition, params));
      return `(${orConditions.join(' OR ')})`;
    } else {
      const key = Object.keys(conditionObject)[0];
      const value = conditionObject[key];
      params.push(value); // Add value to the params array
      return `${key} = $${params.length}`;
    }
  }
}