const {
  addExerciseToWorkout,
} = require("../models/workoutExerciseModel");

const createWorkoutExercise = async (req, res) => {
  try {
    const { workout_id, exercise_id } = req.body;

    if (!workout_id || !exercise_id) {
      return res.status(400).json({
        message: "workout_id and exercise_id are required",
      });
    }

    const result = await addExerciseToWorkout(
      workout_id,
      exercise_id
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("CREATE WORKOUT EXERCISE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createWorkoutExercise,
};