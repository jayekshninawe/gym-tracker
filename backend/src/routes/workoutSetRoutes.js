const express = require("express");

const {
  createWorkoutSet,
} = require("../controllers/workoutSetController");

const router = express.Router();

router.post("/", createWorkoutSet);

module.exports = router;