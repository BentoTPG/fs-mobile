import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bodyParser from 'body-parser';

const app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'food_database'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

app.use(cors());
app.use(bodyParser.json());

// Endpoint for fetching all menus
app.get('/api/food_database', function (req, res, next) {
  connection.query('SELECT * FROM menus', function(err, results, fields) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Endpoint for fetching a specific menu by ID
app.get('/api/food_database/:menu_id', function (req, res, next) {
  const menu_id = req.params.menu_id;
  connection.query('SELECT * FROM menus WHERE menu_id = ?', [menu_id], function(err, results) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

// Endpoint for fetching ingredients of a specific menu by ID
app.get('/api/food_database/:menu_id/ingredients', function (req, res, next) {
  const menu_id = req.params.menu_id;
  const query = `
    SELECT 'carbohydrates' as type, carbohydrate as name FROM carbohydrates WHERE menu_id = ?
    UNION ALL
    SELECT 'condiments' as type, condiment as name FROM condiments WHERE menu_id = ?
    UNION ALL
    SELECT 'fats' as type, fat as name FROM fats WHERE menu_id = ?
    UNION ALL
    SELECT 'fruits' as type, fruit as name FROM fruits WHERE menu_id = ?
    UNION ALL
    SELECT 'proteins' as type, protein as name FROM proteins WHERE menu_id = ?
    UNION ALL
    SELECT 'spices' as type, spice as name FROM spices WHERE menu_id = ?
    UNION ALL
    SELECT 'vegetables' as type, vegetable as name FROM vegetables WHERE menu_id = ?
  `;
  connection.query(query, [menu_id, menu_id, menu_id, menu_id, menu_id, menu_id, menu_id], function(err, results, fields) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.listen(5000, function () {
  console.log('CORS-enabled web server listening on port 5000');
});
