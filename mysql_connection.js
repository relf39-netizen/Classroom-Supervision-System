// Node.js MySQL Connection Command (Sample)
// Used for Windows Server + MySQL Environment
// Install dependency: npm install mysql2

const mysql = require('mysql2');

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',      // Your Windows Server IP or localhost
  user: 'root',           // Your PHPMyAdmin user
  password: '',           // Your PHPMyAdmin password
  database: 'nongwa_supervision' // Change to your DB name
});

// Simple query
connection.query(
  'SELECT * FROM `users` WHERE `username` = "admin"',
  function(err, results, fields) {
    if (err) throw err;
    console.log(results); // Should show the seeded admin
  }
);

module.exports = connection;
