const express = require("express");

const {
  createWorkoutExercise,
} = require("../controllers/workoutExerciseController");

const router = express.Router();

router.post("/", createWorkoutExercise);

module.exports = router;