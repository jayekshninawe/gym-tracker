const pool = require("../config/db");

const createExercise = (user_id, name, muscle_group) => {
  return pool.query(
    `INSERT INTO exercises (user_id, name, muscle_group)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, name, muscle_group]
  );
};

const getExercises = (user_id) => {
  return pool.query(
    `SELECT * FROM exercises
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [user_id]
  );
};

module.exports = {
  createExercise,
  getExercises
};