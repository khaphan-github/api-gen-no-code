import { DataSourceOptions } from "typeorm";

export interface ApplicationModel {
  id: number;
  owner_id: number;
  workspace_id: number;
  app_name: string;
  tables_info: object[];
  database_config: DataSourceOptions;
  use_default_db: boolean;
  create_db_ui: boolean;
  create_db_script: boolean;
  enable: boolean;
  created_at: string;
  updated_at: string;
}
