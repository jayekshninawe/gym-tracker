const pool = require("../config/db");
const workoutModel = require("../models/workoutModel");

const createWorkout = async (req, res) => {
  try {
    const { user_id, name } = req.body;

    const result = await workoutModel.createWorkout(user_id, name);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create workout" });
  }
};

const getWorkoutDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        w.id AS workout_id,
        w.name AS workout_name,
        w.workout_date,
        e.id AS exercise_id,
        e.name AS exercise_name,
        e.muscle_group,
        we.id AS workout_exercise_id,
        ws.id AS set_id,
        ws.set_number,
        ws.weight,
        ws.reps
      FROM workouts w
      LEFT JOIN workout_exercises we
        ON w.id = we.workout_id
      LEFT JOIN exercises e
        ON we.exercise_id = e.id
      LEFT JOIN workout_sets ws
        ON we.id = ws.workout_exercise_id
      WHERE w.id = $1
      ORDER BY e.id, ws.set_number`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getWorkouts = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await workoutModel.getWorkouts(user_id);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch workouts" });
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutDetails,
};