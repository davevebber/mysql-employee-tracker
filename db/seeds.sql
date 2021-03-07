INSERT INTO  department (id, department_name)
VALUES 
    (1, 'Sales'),
    (2, 'Software Development'),
    (3, 'Finance'),
    (4, 'Legal');

INSERT INTO department_role (id, title, salary, department_id)
VALUES 
    (1, 'Junior Sales', 100000, 1),
    (2, 'Lead Sales', 120000, 1),
    (3, 'Junior Developer', 120000, 2),
    (4, 'Lead Developer', 150000, 2),
    (5, 'Finance Lead', 120000, 3),
    (6, 'Lawyer', 150000, 4);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
    (1, 'dave', 'vebber', 1, 1);