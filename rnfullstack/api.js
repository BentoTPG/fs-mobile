export const fetchRecipes = async (token) => {
  try {
    const response = await fetch('https://fridgetofeast-a95f6e626f53.herokuapp.com/api/food_database', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch recipes with status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchRecipes Error:', error);
    throw error;
  }
};

export const fetchMenuById = async (menu_id, token) => {
  try {
    const response = await fetch(`https://fridgetofeast-a95f6e626f53.herokuapp.com/api/food_database/${menu_id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch menu with status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchMenuById Error:', error);
    throw error;
  }
};

export const fetchMenuIngredients = async (menu_id, token) => {
  try {
    const response = await fetch(`https://fridgetofeast-a95f6e626f53.herokuapp.com/api/food_database/${menu_id}/ingredients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch ingredients with status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchMenuIngredients Error:', error);
    throw error;
  }
};
