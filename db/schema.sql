CREATE TABLE department (
    id INTEGER PRIMARY KEY,
    department_name VARCHAR(30) NOT NULL
);

CREATE TABLE department_role (
    id INTEGER PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary INTEGER NOT NULL,
    department_id INTEGER NOT NULL
);

CREATE TABLE employee (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INTEGER NOT NULL,
    manager_id INTEGER NOT NULL
);