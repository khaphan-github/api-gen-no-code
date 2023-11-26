CREATE TABLE IF NOT EXISTS study_class (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255),
    name VARCHAR(255),
    session VARCHAR(255),
    owner_id INTEGER,
    metadata JSONB,
    enable BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_in_class (
    id SERIAL PRIMARY KEY,
    class_id INTEGER,
    student_id INTEGER,
    metadata JSONB,
    enable BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_check_in (
    id SERIAL PRIMARY KEY,
    class_id INTEGER,
    begin_at DATE,
    end_at DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_checked_in_class (
    id SERIAL PRIMARY KEY,
    class_id INTEGER,
    student_id INTEGER,
    metadata JSONB,
    checked_in_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
