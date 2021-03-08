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
        case 'Add a department':
          addDepartment();
          break;

        // add a role
        case 'Add a role':
          addRole();
          break;

        // update employee role
        case 'Update employee role':
          updateEmployee();
          break;
      };
    });
};

// view employees function 
// ===========================================================
// ===========================================================
// ===========================================================
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
// ===========================================================
// ===========================================================
// ===========================================================
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
// ===========================================================
// ===========================================================
// ===========================================================
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
// ===========================================================
// ===========================================================
// ===========================================================
function addEmployee() {

  let roleArray = [];
  let managerArr = [];

  // promisesql to create connection
  promisemysql.createConnection(connectionProperties
  ).then((conn) => {

    // query roles and employee info
    return Promise.all([
      conn.query('SELECT id, title FROM role ORDER BY title ASC'),
      conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
    ]);
  }).then(([roles, managers]) => {

    // role and manager arrays
    for (i = 0; i < roles.length; i++) {
      roleArray.push(roles[i].title);
    }
    for (i = 0; i < managers.length; i++) {
      managerArr.push(managers[i].Employee);
    }

    // return manager + role
    return Promise.all([roles, managers]);
  }).then(([roles, managers]) => {

    // no manager option
    managerArr.unshift('--');

    inquirer.prompt([
      {
        // collect first name
        name: "firstName",
        type: "input",
        message: "First name: ",

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
        // collect last name
        name: "lastName",
        type: "input",
        message: "Last name: ",

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
        // collect role of employee
        name: "role",
        type: "list",
        message: "What is their role?",
        choices: roleArray
      }, {
        // collect manager for employee
        name: "manager",
        type: "list",
        message: "Who is their manager?",
        choices: managerArr
      }]).then((answer) => {

        // id variable
        let roleID;
        // manager defaulto to none
        let managerID = null;

        // role id
        for (i = 0; i < roles.length; i++) {
          if (answer.role == roles[i].title) {
            roleID = roles[i].id;
          }
        }

        // manager role
        for (i = 0; i < managers.length; i++) {
          if (answer.manager == managers[i].Employee) {
            managerID = managers[i].id;
          }
        }

        // add employee
        connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
              VALUES ("${answer.firstName}", "${answer.lastName}", ${roleID}, ${managerID})`, (err, res) => {
          if (err) return err;

          // confirmation
          console.log(`\n EMPLOYEE ${answer.firstName} ${answer.lastName} ADDED...\n `);
          mainMenu();
        });
      });
  });
};

// add department function
// ===========================================================
// ===========================================================
// ===========================================================
function addDepartment() {

  inquirer.prompt({

    // collect department name
    name: "deptName",
    type: "input",
    message: "Department Name: "
  }).then((answer) => {

    // add department to table
    connection.query(`INSERT INTO department (name)VALUES ("${answer.deptName}");`, (err, res) => {
      if (err) return err;
      console.log("\n DEPARTMENT ADDED...\n ");
      mainMenu();
    });
  });
};

// add role function
// ===========================================================
// ===========================================================
// ===========================================================
function addRole() {

  let departmentArr = [];

  // promisesql to create connection
  promisemysql.createConnection(connectionProperties)
    .then((conn) => {

      // department query
      return conn.query('SELECT id, name FROM department ORDER BY name ASC');

    }).then((departments) => {

      // departments array
      for (i = 0; i < departments.length; i++) {
        departmentArr.push(departments[i].name);
      }

      return departments;
    }).then((departments) => {

      inquirer.prompt([
        {
          // collect role title
          name: "roleTitle",
          type: "input",
          message: "Role title: "
        },
        {
          // collect salary
          name: "salary",
          type: "number",
          message: "Salary: "
        },
        {
          // collect department for role
          name: "dept",
          type: "list",
          message: "Department: ",
          choices: departmentArr
        }]).then((answer) => {

          // department id
          let deptID;

          // department id select
          for (i = 0; i < departments.length; i++) {
            if (answer.dept == departments[i].name) {
              deptID = departments[i].id;
            }
          }

          // confirm role added
          connection.query(`INSERT INTO role (title, salary, department_id)
              VALUES ("${answer.roleTitle}", ${answer.salary}, ${deptID})`, (err, res) => {
            if (err) return err;
            console.log(`\n ROLE ${answer.roleTitle} ADDED...\n`);
            mainMenu();
          });
        });
    });
};

// update employee role function
// ===========================================================
// ===========================================================
// ===========================================================
function updateEmployee() {

  let employeeArray = [];
  let roleArray = [];

  // promise mysql connection
  promisemysql.createConnection(connectionProperties
  ).then((conn) => {
    return Promise.all([

      // query all roles and employee
      conn.query('SELECT id, title FROM role ORDER BY title ASC'),
      conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
    ]);
  }).then(([roles, employees]) => {

    // show roles
    for (i = 0; i < roles.length; i++) {
      roleArray.push(roles[i].title);
    }

    // show employees
    for (i = 0; i < employees.length; i++) {
      employeeArray.push(employees[i].Employee);
      //console.log(value[i].name);
    }

    return Promise.all([roles, employees]);
  }).then(([roles, employees]) => {

    inquirer.prompt([
      {
        // select employee to update
        name: "employee",
        type: "list",
        message: "Who would you like to edit?",
        choices: employeeArray
      }, {
        // select updated role
        name: "role",
        type: "list",
        message: "What is their new role?",
        choices: roleArray
      },]).then((answer) => {

        let roleID;
        let employeeID;

        /// get role id
        for (i = 0; i < roles.length; i++) {
          if (answer.role == roles[i].title) {
            roleID = roles[i].id;
          }
        }

        // get employee id
        for (i = 0; i < employees.length; i++) {
          if (answer.employee == employees[i].Employee) {
            employeeID = employees[i].id;
          }
        }

        // give employee new role
        connection.query(`UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID}`, (err, res) => {
          if (err) return err;

          // confirmation
          console.log(`\n ${answer.employee} ROLE UPDATED TO ${answer.role}...\n `);

          mainMenu();
        });
      });
  });
};