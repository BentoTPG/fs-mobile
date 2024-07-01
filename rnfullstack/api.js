export const fetchIngredients = async () => {
  const response = await fetch('http://10.0.2.2:5000/api/ingredients');
  return response.json();
};

export const addIngredient = async (ingredient) => {
  const response = await fetch('http://10.0.2.2:5000/api/ingredients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: ingredient.name }),
  });
  return response.json();
};

export const fetchRecipes = async () => {
  const response = await fetch('http://10.0.2.2:5000/api/food_database');
  return response.json();
};

export const fetchMenuIngredients = async (menu_id) => {
  const response = await fetch(`http://10.0.2.2:5000/api/food_database/${menu_id}/ingredients`);
  return response.json();
};
