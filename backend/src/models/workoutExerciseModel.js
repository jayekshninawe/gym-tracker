const pool = require("../config/db");

const addExerciseToWorkout = async (workout_id, exercise_id) => {
  const result = await pool.query(
    `INSERT INTO workout_exercises (workout_id, exercise_id)
     VALUES ($1, $2)
     RETURNING id, workout_id, exercise_id, created_at`,
    [workout_id, exercise_id]
  );

  return result.rows[0];
};

module.exports = {
  addExerciseToWorkout,
};