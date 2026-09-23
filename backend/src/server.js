const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const workoutExerciseRoutes = require("./routes/workoutExerciseRoutes");
const workoutSetRoutes = require("./routes/workoutSetRoutes");
const cors = require("cors");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workout-exercises", workoutExerciseRoutes);
app.use("/api/workout-sets", workoutSetRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "Gym Tracker API is running"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});