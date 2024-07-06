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

app.post('/api/add_ingredients', (req, res) => {
  const ingredientNames = req.body.ingredient_names;

  if (!ingredientNames || !Array.isArray(ingredientNames)) {
    return res.status(400).json({ error: 'Invalid ingredient names' });
  }

  // Check if the ingredients already exist
  const placeholders = ingredientNames.map(() => '?').join(',');
  const query = `SELECT ingredient_name FROM useringredients WHERE ingredient_name IN (${placeholders})`;

  connection.query(query, ingredientNames, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const existingIngredients = results.map(row => row.ingredient_name);
    const newIngredients = ingredientNames.filter(name => !existingIngredients.includes(name));

    if (newIngredients.length === 0) {
      return res.status(200).json({ success: false, message: 'All ingredients already exist' });
    }

    // Insert new ingredients
    const insertQuery = 'INSERT INTO useringredients (ingredient_name) VALUES ?';
    const values = newIngredients.map(name => [name]);

    connection.query(insertQuery, [values], (insertErr, insertResults) => {
      if (insertErr) {
        return res.status(500).json({ error: insertErr.message });
      }

      res.status(200).json({ success: true, results: insertResults });
    });
  });
});

// Endpoint for fetching matching menus based on useringredients
app.get('/api/matching_menus', function (req, res, next) {
  const query = `
    SELECT DISTINCT ua.menu_id, m.menu_name, m.menu_image
    FROM ingredients_all ua
    JOIN menus m ON ua.menu_id = m.menu_id
    WHERE ua.ingredient IN (SELECT ingredient_name FROM useringredients)
    GROUP BY ua.menu_id, m.menu_name, m.menu_image
    HAVING COUNT(DISTINCT ua.ingredient) = (SELECT COUNT(DISTINCT ua2.ingredient) FROM ingredients_all ua2 WHERE ua2.menu_id = ua.menu_id);
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

    // Reset AUTO_INCREMENT after deleting
    connection.query('ALTER TABLE useringredients AUTO_INCREMENT = 1', function(autoErr, autoResults) {
      if (autoErr) {
        return res.status(500).json({ error: autoErr.message });
      }
      res.json({ success: true });
    });
  });
});

// Endpoint for clearing all user ingredients
app.delete('/api/clear_user_ingredients', function (req, res, next) {
  connection.query('DELETE FROM useringredients', function(err, results) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Reset AUTO_INCREMENT after deleting all rows
    connection.query('ALTER TABLE useringredients AUTO_INCREMENT = 1', function(autoErr, autoResults) {
      if (autoErr) {
        return res.status(500).json({ error: autoErr.message });
      }
      res.json({ success: true });
    });
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
