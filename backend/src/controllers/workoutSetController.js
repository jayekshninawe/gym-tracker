const {
  addWorkoutSet,
} = require("../models/workoutSetModel");

const createWorkoutSet = async (req, res) => {
  try {
    const {
      workout_exercise_id,
      set_number,
      weight,
      reps,
    } = req.body;

    if (
      workout_exercise_id === undefined ||
      set_number === undefined ||
      weight === undefined ||
      reps === undefined
    ) {
      return res.status(400).json({
        message:
          "workout_exercise_id, set_number, weight and reps are required",
      });
    }

    const result = await addWorkoutSet(
      workout_exercise_id,
      set_number,
      weight,
      reps
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("CREATE WORKOUT SET ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createWorkoutSet,
};