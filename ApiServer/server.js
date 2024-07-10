import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const jsonParser = bodyParser.json();
const secret = 'fullstack-login';
const app = express();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true // enable multi-statements for prepared statements
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

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ status: 'error', message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ status: 'error', message: 'Token missing' });

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ status: 'error', message: 'Token invalid' });

    console.log('Decoded JWT:', user); // เพิ่มการบันทึกค่าที่ถูกถอดรหัสจาก JWT

    req.user = user; // Set the decoded user info in req.user
    next();
  });
};

app.post('/register', jsonParser, (req, res, next) => {
  const { email, password, fname, lname } = req.body;
  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    connection.execute(
      'INSERT INTO users (email, password, fname, lname) VALUES (?, ?, ?, ?)',
      [email, hash, fname, lname],
      (err, results) => {
        if (err) {
          res.status(500).json({ status: 'error', message: err });
          return;
        }
        res.status(201).json({ status: 'ok', user_id: results.insertId });
      }
    );
  });
});

app.post('/login', jsonParser, (req, res, next) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  connection.execute(query, [email], (err, users) => {
    if (err) return res.json({ status: 'error', message: err });
    if (users.length === 0) return res.json({ status: 'error', message: 'No user found' });

    bcrypt.compare(password, users[0].password, (err, isLogin) => {
      if (isLogin) {
        const expiresIn = 3600000;
        const token = jwt.sign({ email: users[0].email, user_id: users[0].user_id }, secret, { expiresIn }); // Add user_id to token payload
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
        res.json({ status: 'ok', message: 'login success', token, expiresAt, user_id: users[0].user_id }); // Return user_id in response
      } else {
        res.json({ status: 'error', message: 'login failed' });
      }
    });
  });
});

app.post('/authen', authenticateToken, (req, res, next) => {
  res.json({ status: 'ok', decoded: req.user });
});

app.get('/api/food_database', authenticateToken, (req, res, next) => {
  connection.query('SELECT * FROM menus', (err, results, fields) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/food_database/:menu_id', authenticateToken, (req, res, next) => {
  const menu_id = req.params.menu_id;
  connection.execute('SELECT * FROM menus WHERE menu_id = ?', [menu_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

app.get('/api/food_database/:menu_id/ingredients', authenticateToken, (req, res, next) => {
  const menu_id = req.params.menu_id;
  const query = 'SELECT ingredient FROM ingredients_all WHERE menu_id = ? ORDER BY menu_id';
  connection.execute(query, [menu_id], (err, results, fields) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/ingredients', authenticateToken, (req, res, next) => {
  connection.query('SELECT * FROM ingredients', (err, results, fields) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/add_ingredients', authenticateToken, (req, res) => {
  const { ingredient_names } = req.body;
  const user_id = req.user.user_id; // Get user_id from req.user

  // บันทึกค่าพารามิเตอร์เพื่อการดีบั๊ก
  console.log('Received ingredient_names:', Ingredient_names);
  console.log('Received user_id:', user_id);

  // ตรวจสอบว่ามีการส่ง user_id และ ingredient_names มาหรือไม่
  if (!Ingredient_names || !Array.isArray(Ingredient_names) || !user_id) {
    return res.status(400).json({ error: 'Invalid ingredient names or user_id' });
  }

  const placeholders = ingredient_names.map(() => '?').join(',');
  const query = `SELECT Ingredient_name FROM useringredients WHERE Ingredient_name IN (${placeholders}) AND user_id = ?`;

  // บันทึกค่าพารามิเตอร์ query เพื่อการดีบั๊ก
  console.log('Executing query:', query);
  console.log('Query parameters:', [...Ingredient_names, user_id]);

  connection.execute(query, [...Ingredient_names, user_id], (err, results) => {
    if (err) {
      console.error('Database query error:', err); // เพิ่มการบันทึกข้อผิดพลาด
      return res.status(500).json({ error: err.message });
    }

    const existingIngredients = results.map(row => row.Ingredient_name);
    const newIngredients = Ingredient_names.filter(name => !existingIngredients.includes(name));

    if (newIngredients.length === 0) {
      return res.status(200).json({ success: false, message: 'All ingredients already exist' });
    }

    const insertQuery = 'INSERT INTO useringredients (Ingredient_name, user_id) VALUES ?';
    const values = newIngredients.map(name => [name, user_id]);

    // บันทึกค่าพารามิเตอร์ insert เพื่อการดีบั๊ก
    console.log('Inserting values:', values);

    connection.query(insertQuery, [values], (insertErr, insertResults) => {
      if (insertErr) {
        console.error('Database insert error:', insertErr); // เพิ่มการบันทึกข้อผิดพลาด
        return res.status(500).json({ error: insertErr.message });
      }

      res.status(200).json({ success: true, results: insertResults });
    });
  });
});

app.get('/api/matching_menus', authenticateToken, (req, res, next) => {
  const query = `
    SELECT DISTINCT ua.menu_id, m.menu_name, m.menu_image
    FROM ingredients_all ua
    JOIN menus m ON ua.menu_id = m.menu_id
    WHERE ua.ingredient IN (SELECT ingredient_name FROM useringredients)
    GROUP BY ua.menu_id, m.menu_name, m.menu_image
    HAVING COUNT(DISTINCT ua.ingredient) = (SELECT COUNT(DISTINCT ua2.ingredient) FROM ingredients_all ua2 WHERE ua2.menu_id = ua.menu_id);
  `;
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Fetch user ingredients with user_id
app.get('/api/user_ingredients', authenticateToken, (req, res, next) => {
  const user_id = req.user.user_id;
  const query = 'SELECT * FROM useringredients WHERE user_id = ?';

  connection.execute(query, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete('/api/user_ingredient', authenticateToken, (req, res, next) => {
  const ingredientName = req.body.ingredient_name;

  if (!ingredientName) return res.status(400).json({ error: 'ingredient_name is required' });

  connection.execute('DELETE FROM useringredients WHERE ingredient_name = ?', [ingredientName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    connection.query('ALTER TABLE useringredients AUTO_INCREMENT = 1', (autoErr, autoResults) => {
      if (autoErr) return res.status(500).json({ error: autoErr.message });
      res.json({ success: true });
    });
  });
});

app.delete('/api/clear_user_ingredients', authenticateToken, (req, res, next) => {
  connection.query('DELETE FROM useringredients', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    connection.query('ALTER TABLE useringredients AUTO_INCREMENT = 1', (autoErr, autoResults) => {
      if (autoErr) return res.status(500).json({ error: autoErr.message });
      res.json({ success: true });
    });
  });
});

app.get('/api/categories', authenticateToken, (req, res, next) => {
  connection.query('SELECT DISTINCT ingredient_category FROM ingredients', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const categories = results.map(result => result.ingredient_category);
    res.json(categories);
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log('CORS-enabled web server listening on port', process.env.PORT || 5000);
});
