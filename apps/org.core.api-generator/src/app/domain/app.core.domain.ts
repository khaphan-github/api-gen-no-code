import { DataSourceOptions } from "typeorm";
import { CREATE_APPLICATIONS_TABLE_SCRIPT, CREATE_GENERATED_APIS_TABLE_SCRIPT, CREATE_WORKSPACE_TABLE_SCRIPT, WORKSPACE_TABLE_NAME } from "./app.core.domain.script";
import { AST } from "node-sql-parser";

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
    return `user.config.db/workspace.config.json`;
  }

  // Script to insert new recored to workspace table,
  insertWorkspace(workspaceInfo: ICreateWorkspace) {
    return {
      query: `
        INSERT INTO ${WORKSPACE_TABLE_NAME} (
          id,
          owner_id, 
          database_config, 
          plugin_config, 
          genneral_config, 
          created_at, 
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      params: [
        this.getDefaultWorkspaceId(),
        workspaceInfo.ownerId,
        workspaceInfo.database_config,
        workspaceInfo.plugin_config,
        workspaceInfo.genneral_config,
        new Date(),
        new Date(),
      ]
    }
  }

  extranTableInforFromSQLParser = (parsed: AST | AST[]) => {
    return JSON.stringify(parsed);
  }
}