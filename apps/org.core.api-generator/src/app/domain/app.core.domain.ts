export type AppConfigDomain = {
  appName: string;
  database: string; // Type of databsse
  databaseName: string;
  host: string;
  password: string;
  port: number,
  username: string;
}

export interface IInsertCoreHostConfig {
  ownerId: string;
  databaseType: string;
  databaseName: string;
  host: string;
  password: string;
  port: number,
  username: string;
}

export class AppCoreDomain {
  // CreateAPP;
  createHostSQLScriptPG() {
    return `
      CREATE TABLE IF NOT EXISTS _core_host_config (
        id SERIAL PRIMARY KEY,
        owner_id VARCHAR(255),
        db_type VARCHAR(15),
        host VARCHAR(255),
        port INTEGER,
        username VARCHAR(255),
        password VARCHAR(255),
        database_name VARCHAR(255)
     );
    `
  }

  createAPITableSQLScriptPG() {
    return `
      CREATE TABLE IF NOT EXISTS _core_apis (
        id SERIAL PRIMARY KEY,
        api_path VARCHAR(155),
        method VARCHAR(10),
        table_name VARCHAR(255),
        enable INTEGER
    );
    `
  }

  createAppTableSQLScriptPG() {
    return `
      CREATE TABLE IF NOT EXISTS _core_apps (
        id SERIAL PRIMARY KEY,
        app_name VARCHAR(255),
        tables JSONB
      );`
    // Created Date;
  }

  insertDbConfig(config: IInsertCoreHostConfig) {
    return {
      query: `
        INSERT INTO _core_host_config 
        (owner_id, db_type, host, port, username, password, database_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      params: [
        config.ownerId,
        config.databaseType,
        config.host,
        config.port,
        config.username,
        config.password,
        config.databaseName,
      ]
    }
  }
}