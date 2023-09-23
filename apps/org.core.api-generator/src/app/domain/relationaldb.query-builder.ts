import _ from "lodash";

export interface ConditionObject {
  and?: ConditionObject[];
  or?: ConditionObject[];
  [key: string]: string | ConditionObject[] | undefined;
}
export type SortType = 'ASC' | 'DESC';
export type SelectQueryType = {
  orderby?: string;
  page?: number;
  size?: number;
  sort?: SortType;
  conditions?: ConditionObject;
}

export type QueryBuilderResult = {
  queryString: string;
  params: Array<unknown>;
}

export class RelationalDBQueryBuilder {
  constructor(
    private table?: string,
    public columns?: string[]
  ) { }

  setTableName = (tableName: string) => {
    this.table = tableName;
  }

  setColumns = (columns: string[]) => {
    this.columns = columns;
  }

  deleteBy = (columnName: string, value: unknown): QueryBuilderResult => {
    this.validateColumns([columnName]);

    const queryString = `
      DELETE FROM ${this.table}
      WHERE ${columnName} = $1;
    `;
    return {
      queryString: queryString,
      params: [value]
    };
  }

  // @param data: key is table columns name and value is table value.
  // @param returning: attribute want to turn after insert;
  insert = (data: object, returning?: string[]): QueryBuilderResult => {
    const columns = Object.keys(data);

    this.validateColumns(returning);
    this.validateColumns(columns);


    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const returningQuery = returning ? returning.join(', ') : '*';

    const queryString = `
     INSERT INTO ${this.table} (${columns.join(', ')}) 
     VALUES (${placeholders})
     RETURNING ${returningQuery};
    `;

    const values = Object.values(data);

    return {
      queryString: queryString,
      params: values
    };
  }

  // should update by id
  update = (idColumnName: string, idColumnValue: unknown, data: object): QueryBuilderResult => {
    if (_.isEmpty(data)) {
      throw new Error(`Error when update data id: ${idColumnValue}, data shoud not be empty!`);
    }
    this.validateColumns([idColumnName]);

    const columns = Object.keys(data);
    const values = Object.values(data);

    const queryParams = columns.map((col, index) => `${col} = $${index + 1}`);
    const attributeUpdateQuery = queryParams.join(', ');

    values.push(idColumnValue);

    const queryString = `
      UPDATE ${this.table}
      SET ${attributeUpdateQuery}
      WHERE ${idColumnName} = $${values.length}
      RETURNING ${columns.join(', ')}
      ;
    `;

    return {
      queryString: queryString,
      params: values
    }
  }

  getByQuery = (types?: SelectQueryType, selected?: string[],): QueryBuilderResult => {
    let selectedQuery = '*';

    if (!_.isNil(selected) && selected) {
      this.validateColumns(selected);
      if (selected.length == 1) {
        selectedQuery = selected[0];
      } else {
        selectedQuery = selected?.join(', ');
      }
    }
    const defaultQuery = `
      SELECT ${selectedQuery}
      FROM ${this.table}
    `;

    if (types) {
      const { orderby, page, size, sort, conditions } = types;
      if (orderby) {
        this.validateColumns([orderby]);
      }

      // Prepare where condition
      const conditionParams: string[] = [];
      const conditionQuery = this.generateConditionQuery(conditions, conditionParams);
      const whereQuery = !_.isEmpty(conditions) ? ` WHERE ${conditionQuery} ` : '';

      // Prepare orderby contidion;
      const sortQuery = sort ? 'ASC' : 'DESC';
      const orderByQuery = orderby ? ` ORDER BY ${orderby} ${sortQuery}` : '';

      // Prepare page and size contition;
      if (page && page < 0) {
        throw new Error(`Page should be greater than 0`);
      }
      if (size && size < 0) {
        throw new Error(`Size should be greater than 0`);
      }
      const sizeQuery = size ? ` LIMIT ${+size} ` : '';
      const pageQuery = page ? ` OFFSET ${+page} ` : '';


      const queryString = `
      ${defaultQuery}
      ${whereQuery}
      ${orderByQuery}
      ${sizeQuery}
      ${pageQuery};
    `;

      return {
        queryString: queryString,
        params: conditionParams
      }
    } else {
      return {
        queryString: defaultQuery,
        params: []
      }
    }
  }

  validateColumns = (columns: string[]) => {
    const invalidColumns = columns?.filter(col => !this.columns.includes(col));
    if (invalidColumns.length > 0) {
      throw new Error(`Invalid columns specified: ${invalidColumns.join(', ')}, columns shoud include: ${this.columns.join(', ')}`);
    };
  }

  generateConditionQuery = (conditionObject: ConditionObject, params: unknown[]): string => {
    if ('and' in conditionObject) {
      const andConditions = conditionObject.and?.map((condition) => this.generateConditionQuery(condition, params));
      return `(${andConditions.join(' AND ')})`;
    } else if ('or' in conditionObject) {
      const orConditions = conditionObject.or?.map((condition) => this.generateConditionQuery(condition, params));
      return `(${orConditions.join(' OR ')})`;
    } else {
      const key = Object.keys(conditionObject)[0];
      this.validateColumns([key]);
      const value = conditionObject[key];
      if (value !== undefined) {
        params.push(value);
      }
      return `${key} = $${params.length}`;
    }
  }
}