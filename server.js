// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

let db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, phone TEXT)");

  const stmt = db.prepare("INSERT INTO contacts VALUES (NULL, ?, ?, ?)");
  stmt.run("John Doe", "john.doe@example.com", "1234567890");
  stmt.run("Jane Smith", "jane.smith@example.com", "0987654321");
  stmt.finalize();
});

// Get all contacts
app.get('/api/contacts', (req, res) => {
  db.all("SELECT * FROM contacts", [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

// Add a new contact
app.post('/api/contacts', (req, res) => {
  const { name, email, phone } = req.body;
  db.run(`INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)`, [name, email, phone], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});