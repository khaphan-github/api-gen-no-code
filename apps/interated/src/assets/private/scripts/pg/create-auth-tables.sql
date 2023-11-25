CREATE TABLE
    IF NOT EXISTS _core_account (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        password VARCHAR(255),
        metadata JSONB,
        enable BOOLEAN,
        created_at timestamp(0) without time zone DEFAULT NOW(),
        updated_at timestamp(0) without time zone DEFAULT NOW()
    );

CREATE TABLE
    IF NOT EXISTS _core_role (
        id SERIAL PRIMARY KEY,
        display_name VARCHAR(255),
        description VARCHAR(255),
        metadata JSONB,
        enable BOOLEAN,
        created_at timestamp(0) without time zone DEFAULT NOW(),
        updated_at timestamp(0) without time zone DEFAULT NOW()
    );

CREATE TABLE
    IF NOT EXISTS _core_role_and_generated_api (
        id SERIAL PRIMARY KEY,
        generated_api_id INTEGER REFERENCES _core_generated_apis(id),
        role_id INTEGER REFERENCES _core_role(id),
        display_name VARCHAR(255),
        description VARCHAR(255),
        metadata JSONB,
        enable BOOLEAN,
        created_at timestamp(0) without time zone DEFAULT NOW(),
        updated_at timestamp(0) without time zone DEFAULT NOW()
    );

CREATE TABLE
    IF NOT EXISTS _core_account_and_role (
        id SERIAL PRIMARY KEY,
        account_id INTEGER REFERENCES _core_account(id),
        role_id INTEGER REFERENCES _core_role(id),
        description VARCHAR(255),
        metadata JSONB,
        enable BOOLEAN,
        created_at timestamp(0) without time zone DEFAULT NOW(),
        updated_at timestamp(0) without time zone DEFAULT NOW()
    );
