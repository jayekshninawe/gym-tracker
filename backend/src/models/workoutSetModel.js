const pool = require("../config/db");

const addWorkoutSet = async (
  workout_exercise_id,
  set_number,
  weight,
  reps
) => {
  const result = await pool.query(
    `INSERT INTO workout_sets
     (workout_exercise_id, set_number, weight, reps)
     VALUES ($1, $2, $3, $4)
     RETURNING id, workout_exercise_id, set_number, weight, reps, created_at`,
    [
      workout_exercise_id,
      set_number,
      weight,
      reps,
    ]
  );

  return result.rows[0];
};

module.exports = {
  addWorkoutSet,
};