import express from 'express';
import cors from 'cors';
var app = express()

import mysql from 'mysql2';

// Your other imports and code...

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'food_database'
});

app.use(cors())

app.get('/api/food_database', function (req, res, next) {
  connection.query(
    'SELECT * FROM menus',
    function(err, results, fields) {
      res.json(results);
    }
  );
})

app.get('/api/food_database/:menu_id', function (req, res, next) {
  const menu_id = req.params.menu_id
  connection.query(
    'SELECT * FROM menus WHERE menu_id = ?',
    [menu_id],
    function(err, results) {
      res.json(results[0]);
    }
  );
})

app.listen(5000, function () {
  console.log('CORS-enabled web server listening on port 5000')
})