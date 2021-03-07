USE employees_db;

INSERT INTO department (id, name)
VALUES 
    (1, 'Sales'),
    (2, 'Engineering'),
    (3, 'Finance'),
    (4, 'Legal');

INSERT INTO role (id, title, salary, department_id)
VALUES 
    (1, 'Sales Lead', 90000, 1),
    (2, 'Sales Person', 75000, 1),    
    (3, 'Lead Engineer', 110000, 2),
    (4, 'Software Engineer', 95000, 2),
    (5, 'Legal Team Lead', 100000, 3),
    (6, 'Lawyer', 90000, 3),   
    (7, 'Accountant', 65000, 4);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
    (1, 'Dave', 'Vebber', 1, null),
    (2, 'Mike', 'Coin', 2, 1),
    (3, 'Corey', 'Robert', 2, 1),
    (4, 'Rebecca', 'Victor', 3, null),
    (5, 'Steve', 'White', 4, 4),
    (6, 'Ashley', 'Delano', 4, 4),
    (7, 'John', 'Jack', 5, null),
    (8, 'Frances', 'Anton', 6, 7),
    (9, 'Frankie', 'Ford', 7, null);