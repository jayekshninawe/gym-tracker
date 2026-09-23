const pool = require("../config/db");

const createWorkout = (user_id, name) => {
  return pool.query(
    `INSERT INTO workouts (user_id, name)
     VALUES ($1, $2)
     RETURNING *`,
    [user_id, name]
  );
};

const getWorkouts = (user_id) => {
  return pool.query(
    `SELECT * FROM workouts
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [user_id]
  );
};

module.exports = {
  createWorkout,
  getWorkouts
};