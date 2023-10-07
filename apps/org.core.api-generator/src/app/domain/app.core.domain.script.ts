export const WORKSPACE_TABLE_NAME = `_core_workspace_config`;
export const GENERATED_APIS_TABLE_NAME = `_core_generated_apis`;
export const APPLICATIONS_TABLE_NAME = `_core_applications`;
export const APPLICATIONS_TABLE_AVAILABLE_COLUMS = [
  "id",
  "owner_id",
  "workspace_id",
  "app_name",
  "tables_info",
  "database_config",
  "use_default_db",
  "create_db_ui",
  "create_db_script",
  "enable",
  "created_at",
  'updated_at'
];

export enum EAppTableColumns {
  ID = 'id',
  OWNER_ID = 'owner_id',
  WORKSPACE_ID = 'workspace_id',
  APP_NAME = 'app_name',
  TABLES_INFO = 'tables_info',
  DATABASE_CONFIG = 'database_config',
  USE_DEFAULT_DB = 'use_default_db',
  CREATE_DB_UI = 'create_db_ui',
  CREATE_DB_SCRIPT = 'create_db_script',
  ENABLE = 'enable',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at'
}

export const GENERATED_APIS_AVAILABLE_COLUMNS = [
  'id',
  'app_id',
  'table_name',
  'action',
  'api_path',
  'http_method',
  'authentication',
  'api_authorized',
  'headers',
  'request_params',
  'request_body_type',
  'request_body',
  'response_attributes',
  'enable',
  'created_at',
  'updated_at'
];

export enum EGeneratedApisTableColumns {
  ID = 'id',
  APP_ID = 'app_id',
  TABLE_NAME = 'table_name',
  ACTION = 'action',
  API_PATH = 'api_path',
  HTTP_METHOD = 'http_method',
  AUTHENTICATION = 'authentication',
  API_AUTHORIZED = 'api_authorized',
  HEADERS = 'headers',
  REQUEST_PARAMS = 'request_params',
  REQUEST_BODY_TYPE = 'request_body_type',
  REQUEST_BODY = 'request_body',
  RESPONSE_ATTRIBUTES = 'response_attributes',
  ENABLE = 'enable',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at'
}

export const WORKSPACE_AVAILABLE_COLUMNS = [
  'id',
  'owner_id',
  'database_config',
  'plugin_config',
  'genneral_config',
  'created_at',
  'updated_at',
]
export enum EWorkspaceColumns {
  ID = 'id',
  OWNER_ID = 'owner_id',
  DATABASE_CONFIG = 'database_config',
  PLUGIN_CONFIG = 'plugin_config',
  GENERAL_CONFIG = 'genneral_config',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export const CREATE_WORKSPACE_TABLE_SCRIPT = `
  CREATE TABLE IF NOT EXISTS ${WORKSPACE_TABLE_NAME} (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(255),

    database_config JSONB,
    plugin_config JSONB,
    genneral_config JSONB,

    created_at timestamp(0) without time zone DEFAULT NOW(),
    updated_at timestamp(0) without time zone DEFAULT NOW()
  );
`;

export const CREATE_GENERATED_APIS_TABLE_SCRIPT = `
  CREATE TABLE IF NOT EXISTS ${GENERATED_APIS_TABLE_NAME} (
    id SERIAL PRIMARY KEY,
    app_id INTEGER,
    table_name VARCHAR(255),

    action VARCHAR(155),
    api_path VARCHAR(155),
    http_method VARCHAR(10),
    
    authentication VARCHAR(155),
    api_authorized JSONB,
    
    headers JSONB,
    request_params JSONB,
    request_body_type VARCHAR(155),
    request_body JSONB,
    response_attributes JSONB,
    enable BOOLEAN,
    
    created_at timestamp(0) without time zone DEFAULT NOW(),
    updated_at timestamp(0) without time zone DEFAULT NOW() 
  );
`;

export const CREATE_APPLICATIONS_TABLE_SCRIPT = `
  CREATE TABLE IF NOT EXISTS ${APPLICATIONS_TABLE_NAME} (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(255),
    workspace_id INTEGER,
    app_name VARCHAR(255),
    
    tables_info JSONB,
    create_db_script VARCHAR,
    create_db_ui JSONB,

    database_config JSONB,
    use_default_db BOOLEAN,
    enable BOOLEAN,

    created_at timestamp(0) without time zone DEFAULT NOW(),
    updated_at timestamp(0) without time zone DEFAULT NOW()
  );
`;

