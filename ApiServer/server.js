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
    SELECT ingredient
    FROM ingredients_all
    WHERE menu_id = ?
    ORDER BY menu_id;
  `;
  connection.query(query, [menu_id], function(err, results, fields) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/ingredients', function (req, res, next) {
  connection.query('SELECT * FROM ingredients', function(err, results, fields) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/api/add_ingredients', function (req, res, next) {
  const ingredients = req.body.ingredient_names; // รับข้อมูลส่วนผสมจาก body ของคำขอ

  if (!ingredients) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  // ค้นหา ingredient_category สำหรับแต่ละ ingredient_name
  const query = 'SELECT ingredient_name, ingredient_category FROM ingredients WHERE ingredient_name IN (?)';
  connection.query(query, [ingredients], function (err, results) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const values = results.map(result => [result.ingredient_name, result.ingredient_category]);

    connection.query('INSERT INTO useringredients (ingredient_name, ingredient_category) VALUES ?', [values], function (err, results) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, results });
    });
  });
});

// Endpoint for fetching matching menus based on useringredients
app.get('/api/matching_menus', function (req, res, next) {
  const query = `
    SELECT ua.menu_id, m.menu_name, m.menu_image
    FROM ingredients_all ua
    JOIN useringredients ui ON ua.ingredient = ui.ingredient_name
    JOIN menus m ON ua.menu_id = m.menu_id
    GROUP BY ua.menu_id
    HAVING COUNT(DISTINCT ua.ingredient) = (SELECT COUNT(DISTINCT ingredient_name) FROM useringredients WHERE ingredient_name IN (SELECT ingredient FROM ingredients_all WHERE ingredients_all.menu_id = ua.menu_id));
  `;
  connection.query(query, function (err, results) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Endpoint for fetching user ingredients
app.get('/api/user_ingredients', function (req, res, next) {
  connection.query('SELECT * FROM useringredients', function(err, results) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Endpoint for deleting a specific user ingredient
app.delete('/api/user_ingredient', function (req, res, next) {
  const ingredientName = req.body.ingredient_name;
  
  if (!ingredientName) {
    return res.status(400).json({ error: 'ingredient_name is required' });
  }

  connection.query('DELETE FROM useringredients WHERE ingredient_name = ?', [ingredientName], function(err, results) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Endpoint for clearing all user ingredients
app.delete('/api/clear_user_ingredients', function (req, res, next) {
  connection.query('DELETE FROM useringredients', function(err, results) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Endpoint for fetching all categories
app.get('/api/categories', function (req, res, next) {
  connection.query('SELECT DISTINCT ingredient_category FROM ingredients', function(err, results) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const categories = results.map(result => result.ingredient_category);
    res.json(categories);
  });
});

app.listen(5000, function () {
  console.log('CORS-enabled web server listening on port 5000');
});
