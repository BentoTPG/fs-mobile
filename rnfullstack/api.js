export const fetchRecipes = async () => {
  const response = await fetch('http://10.0.2.2:5000/api/food_database');
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Failed to fetch recipes');
  }
};

export const fetchMenuIngredients = async (menu_id) => {
  const response = await fetch(`http://10.0.2.2:5000/api/food_database/${menu_id}/ingredients`);
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Failed to fetch ingredients');
  }
};

export const fetchMenuById = async (menu_id) => {
  const response = await fetch(`http://10.0.2.2:5000/api/food_database/${menu_id}`);
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Failed to fetch menu');
  }
};
