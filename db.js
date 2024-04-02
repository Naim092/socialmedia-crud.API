const mysql = require("mysql2");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  port: 3306,
  database: "nodejstasks",
});

module.exports = conn;





