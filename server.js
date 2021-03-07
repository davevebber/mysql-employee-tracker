const mysql = require('mysql2')
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const promisemysql = require("promise-mysql");


const PORT = process.env.PORT || 3306;

// Create the connection to database
const connectionProperties =
{
  host: 'localhost',
  port: PORT,
  user: 'root',
  password: '',
  database: 'employees_db'
};

const connection = mysql.createConnection(connectionProperties);

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
        case 'Add an employee':
          addEmployee();
          break;

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

// add employee function
function addEmployee() {

  // Create two global array to hold 
  let roleArr = [];
  let managerArr = [];

  // Create connection using promise-sql
  promisemysql.createConnection(connectionProperties
  ).then((conn) => {

    // Query  all roles and all manager. Pass as a promise
    return Promise.all([
      conn.query('SELECT id, title FROM role ORDER BY title ASC'),
      conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
    ]);
  }).then(([roles, managers]) => {

    // Place all roles in array
    for (i = 0; i < roles.length; i++) {
      roleArr.push(roles[i].title);
    }

    // place all managers in array
    for (i = 0; i < managers.length; i++) {
      managerArr.push(managers[i].Employee);
    }

    return Promise.all([roles, managers]);
  }).then(([roles, managers]) => {

    // add option for no manager
    managerArr.unshift('--');

    inquirer.prompt([
      {
        // Prompt user of their first name
        name: "firstName",
        type: "input",
        message: "First name: ",
        // Validate field is not blank
        validate: function (input) {
          if (input === "") {
            console.log("**FIELD REQUIRED**");
            return false;
          }
          else {
            return true;
          }
        }
      },
      {
        // Prompt user of their last name
        name: "lastName",
        type: "input",
        message: "Last name: ",
        // Validate field is not blank
        validate: function (input) {
          if (input === "") {
            console.log("**FIELD REQUIRED**");
            return false;
          }
          else {
            return true;
          }
        }
      },
      {
        // Prompt user of their role
        name: "role",
        type: "list",
        message: "What is their role?",
        choices: roleArr
      }, {
        // Prompt user for manager
        name: "manager",
        type: "list",
        message: "Who is their manager?",
        choices: managerArr
      }]).then((answer) => {

        // Set variable for IDs
        let roleID;
        // Default Manager value as null
        let managerID = null;

        // Get ID of role selected
        for (i = 0; i < roles.length; i++) {
          if (answer.role == roles[i].title) {
            roleID = roles[i].id;
          }
        }

        // get ID of manager selected
        for (i = 0; i < managers.length; i++) {
          if (answer.manager == managers[i].Employee) {
            managerID = managers[i].id;
          }
        }

        // Add employee
        connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
              VALUES ("${answer.firstName}", "${answer.lastName}", ${roleID}, ${managerID})`, (err, res) => {
          if (err) return err;

          // Confirm employee has been added
          console.log(`\n EMPLOYEE ${answer.firstName} ${answer.lastName} ADDED...\n `);
          mainMenu();
        });
      });
  });
};