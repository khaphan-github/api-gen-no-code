import { DataSourceOptions } from "typeorm";
import { CREATE_APPLICATIONS_TABLE_SCRIPT, CREATE_GENERATED_APIS_TABLE_SCRIPT, CREATE_WORKSPACE_TABLE_SCRIPT } from "./pgsql/app.core.domain.pg-script";
import { AST, Create } from "node-sql-parser";
import _ from "lodash";

export type AppConfigDomain = {
  appName: string;
  database: string; // Type of databsse
  databaseName: string;
  host: string;
  password: string;
  port: number,
  username: string;
}

// #region workspace data type
export interface IPluginConfig {
  name: string;
}

export interface IGeneralConfig {
  name: string;
}

export interface ICreateWorkspace {
  id?: number;
  ownerId: string;
  database_config: DataSourceOptions,
  plugin_config?: IPluginConfig,
  genneral_config?: IGeneralConfig,
  created_at?: Date,
  updated_at?: Date,
}
// #endregion 
export class AppCoreDomain {
  // keep first config of user when first time init project,;
  getCreateWorkspaceScript() {
    return CREATE_WORKSPACE_TABLE_SCRIPT;
  }

  // Execute gennerate api task,
  getCreateApisTableScript() {
    return CREATE_GENERATED_APIS_TABLE_SCRIPT;
  }

  getCreateApplicationScript() {
    return CREATE_APPLICATIONS_TABLE_SCRIPT;
    // Created Date;
  }

  getDefaultWorkspaceId() {
    return `connection.json`;
  }

  extractTableInforFromSQLParser = (parsed: AST | AST[]) => {
    return JSON.stringify(parsed);
  }

  convertTableNameByAppId(appId: number, parsed: AST | AST[]) {
    // get table;
    const renameTable = (appId: number, tableName: string) => {
      return `app_${appId}_${tableName.toLocaleLowerCase()}`;
    }

    const findAttribute = (ast: Create) => {
      const newAst = _.cloneDeep(ast);

      if (newAst?.table[0]?.table) {
        newAst.table[0].table = renameTable(appId, newAst.table[0]?.table);
      }
      _.forEach(newAst?.create_definitions, (value) => {
        if (value?.reference_definition?.table[0]?.table) {
          value.reference_definition.table[0].table = renameTable(appId, value.reference_definition.table[0].table);
        }
      });
      return newAst;
    }
    if (parsed && _.isArray(parsed)) {
      return _.map(parsed, (ast: Create) => {
        return findAttribute(ast);
      });
    } else {
      return findAttribute(parsed as Create);
    }
  }

  getTableNameFromParser(parsed: AST | AST[]) {
    const returnTableName = (ast: Create) => ast?.table[0]?.table;

    if (_.isArray(parsed)) {
      return _.map(parsed, (ast: Create) => {
        return returnTableName(ast);
      });
    } else {
      return returnTableName(parsed as Create);
    }
  }

  getSQLConnectionFileName() {
    return `connection.json`;
  }

  getSQLScriptFilename() {
    return `database.sql`;
  }
} 