const express = require("express");

const {
  createWorkout,
  getWorkouts,
  getWorkoutDetails,
} = require("../controllers/workoutController");

const router = express.Router();

router.get("/details/:id", getWorkoutDetails);
router.post("/", createWorkout);
router.get("/:user_id", getWorkouts);


module.exports = router;