const inquirer = require('inquirer');
const { listenerCount } = require('./config/connection');
const db = require('./config/connection');

function init() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'start',
                choices: ['View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department', 'Add a role',
                    'Add an employee',
                    'Update employee role',
                    'Quit'],
                message: 'What would you like to do ?'
            }
        ])
        .then((data) => {
            switch (data.start) {
                case 'View all departments':
                    db.query(`SELECT * FROM department`, (err, res) => {
                        if (err) throw (err);

                        console.log('Viewing all departments: ');
                        console.table(res);

                        init();
                    });

                    break;

                case 'View all roles':
                    db.query(
                        `SELECT R.id, 
                        R.title, 
                        R.salary, 
                        D.name AS department 
                        FROM role AS R 

                        INNER JOIN department AS D 
                        ON R.department_id=D.id
                    
                        ORDER BY R.id ASC`, (err, res) => {
                        if (err) throw (err);

                        console.log('Viewing all roles: ');
                        console.table(res);

                        init();
                    });

                    break;

                case 'View all employees':
                    db.query(
                        `SELECT E.id, 
                        E.first_name, 
                        E.last_name, 
                        R.title,
                        R.salary,
                        D.name AS department,
                        CONCAT (M.first_name, ' ', M.last_name) AS manager
                        FROM employee AS M

                        RIGHT JOIN employee E
                        ON E.manager_id=M.id

                        RIGHT JOIN role AS R 
                        ON E.role_id=R.id 

                        RIGHT JOIN department AS D 
                        ON R.department_id=D.id
                        
                        ORDER BY E.id ASC`, (err, res) => {
                        if (err) throw (err);

                        console.log('Viewing all employees: ');
                        console.table(res);

                        init();
                    });

                    break;

                case 'Add a department':
                    inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'addDept',
                                message: 'Enter the name of the department to be added: '
                            }
                        ])
                        .then((data) => {
                            db.query(`INSERT INTO department SET ?`,
                                {
                                    name: data.addDept,
                                },

                                (err, res) => {
                                    if (err) throw (err);

                                    console.log(`${data.addDept} has been successfully added to the database !`);

                                    init();
                                })
                        })
                    break;
                case 'Add a role':
                    db.query(`SELECT * FROM department`, (err, res) => {
                        if (err) throw (err);

                        let departments = res.map(department => ({ name: department.name, value: department.id }));

                        inquirer
                            .prompt([
                                {
                                    type: 'input',
                                    name: 'roleName',
                                    message: 'Enter the name of the role: ',

                                },
                                {
                                    type: 'input',
                                    name: 'roleSalary',
                                    message: 'Enter the salary amount for this role: '
                                },
                                {
                                    type: 'list',
                                    name: 'roleDept',
                                    message: 'Select a department for this role: ',
                                    choices: departments
                                }
                            ])
                            .then((data) => {
                                db.query(`INSERT INTO role SET ?`,
                                    {
                                        title: data.roleName,
                                        salary: data.roleSalary,
                                        department_id: data.roleDept

                                    },

                                    (err, res) => {
                                        if (err) throw (err);

                                        console.log(`${data.title} has been successfully added to the database !`);

                                        init();
                                    })
                            })
                    })

                    break;
                case 'Add an employee':
                    db.query(`SELECT * FROM role`, (err, res) => {
                        if (err) throw (err);
                        let roles = res.map(role => ({ name: role.title, value: role.id }));

                        db.query(`SELECT * FROM employee`, (err, res) => {
                            if (err) throw (err);
                            let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));

                            inquirer
                                .prompt([
                                    {
                                        type: 'input',
                                        name: 'firstName',
                                        message: 'Enter the first name of the employee: '
                                    },
                                    {
                                        type: 'input',
                                        name: 'lastName',
                                        message: 'Enter the last name of the employee: '
                                    },
                                    {
                                        type: 'list',
                                        name: 'role',
                                        message: 'Select an employee role: ',
                                        choices: roles
                                    },
                                    {
                                        type: 'list',
                                        name: 'manager',
                                        message: 'Select a manager for the employee: ',
                                        choices: employees
                                    }

                                ])
                                .then((data) => {
                                    db.query(`INSERT INTO employee SET ?`,
                                        {
                                            first_name: data.firstName,
                                            last_name: data.lastName,
                                            role_id: data.role,
                                            manager_id: data.manager
                                        },
                                        (err, res) => {
                                            if (err) throw (err);

                                            console.log(`${data.firstName} ${data.lastName} has been successfully added to the database !`);

                                            init();
                                        })
                                })
                        })

                    })
                    break;
                case 'Update employee role':
                    db.query(`SELECT * FROM employee`, (err, res) => {
                        if (err) throw (err);
                        let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));

                        db.query(`SELECT * FROM role`, (err, res) => {
                            if (err) throw (err);
                            let roles = res.map(role => ({ name: role.title, value: role.id }));

                            inquirer
                                .prompt([
                                    {
                                        type: 'list',
                                        name: 'employee',
                                        message: 'Select an employee to update: ',
                                        choices: employees
                                    },
                                    {
                                        type: 'list',
                                        name: 'newRole',
                                        message: "Select a new role for the employee: ",
                                        choices: roles
                                    }
                                ])
                                .then((data) => {
                                    db.query(`UPDATE employee SET ? WHERE ?`,
                                        [
                                            { role_id: data.newRole },
                                            { id: data.employee }
                                        ],
                                        (err, res) => {
                                            if (err) throw (err);

                                            console.log(`Role successfully updated !`);
                                            init();
                                        })
                                })
                        })
                    })
                    break;
                case 'Quit':
                    return;
            }
        })
};

init();

