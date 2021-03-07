const mysql = require('mysql2')
const express = require('express');
const inquirer = require("inquirer");
const consoleTable = require("console.table");

const PORT = process.env.PORT || 3306;
const app = express();

// Create the connection to database
const connection = mysql.createConnection(
  {
    host: 'localhost',
    port: PORT,
    user: 'root',
    password: '',
    database: 'employees_db'
  }
);

connection.connect(err => {
  if (err) throw err;
  console.log('connected as id ' + connection.threadId);
  console.log(`Server running on port ${PORT}`);
});

connection.connect((err) => {
  if (err) throw err;
  console.log('\n WELCOME TO EMPLOYEE TRACKER \n');
  mainMenu();
})

// inquirer prompts user with list of choices
function mainMenu() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'Main Menu',
      choices: [
        'View all employees',
        'View all departments',
        'View all roles',
        'Add an employee',
        'Add a department',
        'Add a role',
        'Update employee role'
      ]
    })

    // depending on what choice user chooses will relate to what info database shows

    .then((answer) => {
      switch (answer.action) {

        // view all employees
        case 'View all employees':
          viewEmployees();
          break;

        // view all departments
        case 'View all departments':
          viewDepartments();
          break;

        // view all roles
        case 'View all roles':
          viewRoles();
          break;

        // add an employee
        // case 'Add an employee':
        //   viewDepartments();
        //   break;

        // add a department
        // case 'Add a department':
        //   viewDepartments();
        //   break;

        // add a role
        // case 'Add a role':
        //   viewDepartments();
        //   break;

        // update employee role
        // case 'Update employee role':
        //   viewDepartments();
        //   break;
      };
    });
};

// view employees function
viewEmployees = () => {
  const query = connection.query(
    "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      mainMenu();
    });
};

// view departments function
viewDepartments = () => {
  const query = connection.query(
    "SELECT * FROM department",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      mainMenu();
    });
};

// view roles function
viewRoles = () => {
  const query = connection.query(
    "SELECT * FROM role",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      mainMenu();
    });
};