const exerciseModel = require("../models/exerciseModel");

const createExercise = async (req, res) => {
  try {
    const { user_id, name, muscle_group } = req.body;

    const result = await exerciseModel.createExercise(
      user_id,
      name,
      muscle_group
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create exercise" });
  }
};

const getExercises = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await exerciseModel.getExercises(user_id);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch exercises" });
  }
};

module.exports = {
  createExercise,
  getExercises
};