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
        'Update employee role',
        'Delete Employee',
        'Delete a role',
        'Delete a department',
        'View Budget'
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

        // delete employee
        case 'Delete Employee':
          deleteEmployee();
          break;

        // delete role
        case 'Delete a role':
          deleteRole();
          break;

        // delete role
        case 'Delete a department':
          deleteDepartment();
          break;

        // view budget
        case 'View Budget':
          viewBudget();
          break;
      };
    });
};

// view employees function 
// ===========================================================
// ===========================================================
// ===========================================================
// function end

viewEmployees = () => {
  const query = connection.query(
    "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      mainMenu();
    });
};
// ===========================================================
// ===========================================================
// ===========================================================
// function end

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
// ===========================================================
// ===========================================================
// ===========================================================
// function end

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

// function end

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
// ===========================================================
// ===========================================================
// ===========================================================
// function end

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
// ===========================================================
// ===========================================================
// ===========================================================
// function end

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
// ===========================================================
// ===========================================================
// ===========================================================
// function end

// update employee role function
// ===========================================================
// ===========================================================
// ===========================================================
function updateEmployee() {

  let employeeArrayay = [];
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
      employeeArrayay.push(employees[i].Employee);
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
        choices: employeeArrayay
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
// ===========================================================
// ===========================================================
// ===========================================================
// function end

// delete employee function
// ===========================================================
// ===========================================================
// ===========================================================
function deleteEmployee() {

  let employeeArray = [];

  // promisesql connection
  promisemysql.createConnection(connectionProperties
  ).then((conn) => {

    // select all employees
    return conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS employee FROM employee ORDER BY Employee ASC");
  }).then((employees) => {

    // employee array
    for (i = 0; i < employees.length; i++) {
      employeeArray.push(employees[i].employee);
    }

    inquirer.prompt([
      {
        // prompt user to delete a employee
        name: "employee",
        type: "list",
        message: "Who would you like to delete?",
        choices: employeeArray
      }, {
        // confirm delete 
        name: "confirm",
        type: "list",
        message: "Confirm deletion",
        choices: ["NO", "YES"]
      }]).then((answer) => {

        if (answer.confirm == "YES") {
          let employeeID;

          // employee id
          for (i = 0; i < employees.length; i++) {
            if (answer.employee == employees[i].employee) {
              employeeID = employees[i].id;
            }
          }

          // delete employee
          connection.query(`DELETE FROM employee WHERE id=${employeeID};`, (err, res) => {
            if (err) return err;

            // confirm deleted employee
            console.log(`\n EMPLOYEE '${answer.employee}' DELETED...\n `);

            // back to main menu
            mainMenu();
          });
        }
        else {

          // if not confirmed, go back to main menu
          console.log(`\n EMPLOYEE '${answer.employee}' NOT DELETED...\n `);

          // back to main menu
          mainMenu();
        }
      });
  });
};
// ===========================================================
// ===========================================================
// ===========================================================
// function end

// Delete Role
// ===========================================================
// ===========================================================
// ===========================================================
function deleteRole() {

  // Create role array
  let roleArr = [];

  // Create connection using promise-sql
  promisemysql.createConnection(connectionProperties
  ).then((conn) => {

    // query all roles
    return conn.query("SELECT id, title FROM role");
  }).then((roles) => {

    // add all roles to array
    for (i = 0; i < roles.length; i++) {
      roleArr.push(roles[i].title);
    }

    inquirer.prompt([{
      // confirm to continue to select role to delete
      name: "continueDelete",
      type: "list",
      message: "*** WARNING *** Deleting role will delete all employees associated with the role. Do you want to continue?",
      choices: ["NO", "YES"]
    }]).then((answer) => {

      // if not, go to main menu
      if (answer.continueDelete === "NO") {
        mainMenu();
      }

    }).then(() => {

      inquirer.prompt([{
        // prompt user of of roles
        name: "role",
        type: "list",
        message: "Which role would you like to delete?",
        choices: roleArr
      }, {
        // confirm to delete role by typing role exactly
        name: "confirmDelete",
        type: "Input",
        message: "Type the role title EXACTLY to confirm deletion of the role"

      }]).then((answer) => {

        if (answer.confirmDelete === answer.role) {

          // get role id of of selected role
          let roleID;
          for (i = 0; i < roles.length; i++) {
            if (answer.role == roles[i].title) {
              roleID = roles[i].id;
            }
          }

          // delete role
          connection.query(`DELETE FROM role WHERE id=${roleID};`, (err, res) => {
            if (err) return err;

            // confirm role has been added 
            console.log(`\n ROLE '${answer.role}' DELETED...\n `);

            //back to main menu
            mainMenu();
          });
        }
        else {

          // if not confirmed, do not delete
          console.log(`\n ROLE '${answer.role}' NOT DELETED...\n `);

          //back to main menu
          mainMenu();
        }

      });
    })
  });
};
// ===========================================================
// ===========================================================
// ===========================================================
// function end

// delete department
// ===========================================================
// ===========================================================
// ===========================================================
function deleteDepartment() {

  // department array
  let deptArray = [];

  // promisesql connection
  promisemysql.createConnection(connectionProperties
  ).then((conn) => {

    // query all departments
    return conn.query("SELECT id, name FROM department");
  }).then((department) => {

    // add departments to array
    for (i = 0; i < department.length; i++) {
      deptArray.push(department[i].name);
    }

    inquirer.prompt([{

      // confirm delete
      name: "continueDelete",
      type: "list",
      message: "*** WARNING *** Deleting a department will delete all roles and employees associated with the department. Do you want to continue?",
      choices: ["NO", "YES"]
    }]).then((answer) => {

      // if not, go back to main menu
      if (answer.continueDelete === "NO") {
        mainMenu();
      }

    }).then(() => {

      inquirer.prompt([{

        // prompt user to select department
        name: "dept",
        type: "list",
        message: "Which department would you like to delete?",
        choices: deptArray
      }, {

        // confirm with user to delete
        name: "confirmDelete",
        type: "Input",
        message: "Type the department name EXACTLY to confirm deletion of the department: "

      }]).then((answer) => {

        if (answer.confirmDelete === answer.dept) {

          // if confirmed, get department id
          let deptID;
          for (i = 0; i < department.length; i++) {
            if (answer.dept == department[i].name) {
              deptID = department[i].id;
            }
          }

          // delete department
          connection.query(`DELETE FROM department WHERE id=${deptID};`, (err, res) => {
            if (err) return err;

            // confirm department has been deleted
            console.log(`\n DEPARTMENT '${answer.dept}' DELETED...\n `);

            // back to main menu
            mainMenu();
          });
        }
        else {

          // do not delete department if not confirmed and go back to main menu
          console.log(`\n DEPARTMENT '${answer.dept}' NOT DELETED...\n `);

          //back to main menu
          mainMenu();
        }

      });
    })
  });
};
// view budget
// ===========================================================
// ===========================================================
// ===========================================================
function viewBudget() {

  // promisesql connection
  promisemysql.createConnection(connectionProperties)
    .then((conn) => {
      return Promise.all([

        // query departments and salaries
        conn.query("SELECT department.name AS department, role.salary FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY department ASC"),
        conn.query('SELECT name FROM department ORDER BY name ASC')
      ]);
    }).then(([deptSalaies, departments]) => {

      let deptBudgetArr = [];
      let department;

      for (d = 0; d < departments.length; d++) {
        let departmentBudget = 0;

        // add all salaries together
        for (i = 0; i < deptSalaies.length; i++) {
          if (departments[d].name == deptSalaies[i].department) {
            departmentBudget += deptSalaies[i].salary;
          }
        }

        // create new property with budgets
        department = {
          Department: departments[d].name,
          Budget: departmentBudget
        }

        // add to array
        deptBudgetArr.push(department);
      }
      console.log("\n");

      // display departments budgets using console.table
      console.table(deptBudgetArr);

      // back to main menu
      mainMenu();
    });
};
// ===========================================================
// ===========================================================
// ===========================================================
// function end