import express from 'express';
import cors from 'cors';
var app = express()

import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'12345678',
  database: 'travel',
});
app.use(cors())

app.get('/api/attractions', async function (req, res, next) {
  try {
    const [results] = await connection.query(
      'SELECT * FROM attraction'
    );
    console.log(results); // results contains rows returned by server
    res.json(results)
  } catch (err) {
    console.log(err);
  }
  
})

app.listen(5000, function () {
  console.log('CORS-enabled web server listening on port 5000')
})