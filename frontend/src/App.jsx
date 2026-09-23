import { useEffect, useState } from "react";

const API = "https://gym-tracker-backend-lhjb.onrender.com/api";
const USER_ID = 2;

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const [exerciseName, setExerciseName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Chest");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // Stores weight/reps for each exercise's next set
  const [setInputs, setSetInputs] = useState({});

  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD WORKOUTS
  // =====================================================

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    try {
      const res = await fetch(`${API}/workouts/${USER_ID}`);

      if (!res.ok) {
        throw new Error("Failed to load workouts");
      }

      const data = await res.json();

      setWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD WORKOUTS ERROR:", error);
      alert("Could not load workouts");
    }
  }

  // =====================================================
  // CREATE WORKOUT
  // =====================================================

  async function createWorkout(e) {
    e.preventDefault();

    if (!workoutName.trim()) {
      alert("Enter a workout name");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: USER_ID,
          name: workoutName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            data.error ||
            "Failed to create workout"
        );
        return;
      }

      setWorkoutName("");

      await loadWorkouts();

      alert("Workout created successfully!");
    } catch (error) {
      console.error("CREATE WORKOUT ERROR:", error);
      alert("Backend connection failed");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // OPEN WORKOUT
  // =====================================================

  async function openWorkout(id) {
    try {
      const res = await fetch(
        `${API}/workouts/details/${id}`
      );

      if (!res.ok) {
        throw new Error("Failed to load workout");
      }

      const data = await res.json();

      setSelectedWorkout({
        id,
        exercises: Array.isArray(data) ? data : [],
      });

      // Clear temporary set inputs
      setSetInputs({});
    } catch (error) {
      console.error("OPEN WORKOUT ERROR:", error);
      alert("Could not load workout");
    }
  }

  // =====================================================
  // ADD EXERCISE + FIRST SET
  // =====================================================

  async function addExercise(e) {
    e.preventDefault();

    if (!selectedWorkout) {
      alert("Please select a workout first");
      return;
    }

    if (!exerciseName.trim()) {
      alert("Enter an exercise name");
      return;
    }

    if (weight === "" || reps === "") {
      alert("Enter weight and reps");
      return;
    }

    const weightNumber = Number(weight);
    const repsNumber = Number(reps);

    if (
      !Number.isFinite(weightNumber) ||
      weightNumber < 0 ||
      !Number.isFinite(repsNumber) ||
      repsNumber <= 0
    ) {
      alert("Enter valid weight and reps");
      return;
    }

    try {
      // =================================================
      // STEP 1: CREATE EXERCISE
      // =================================================

      const exerciseRes = await fetch(`${API}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: USER_ID,
          name: exerciseName.trim(),
          muscle_group: muscleGroup,
        }),
      });

      const exercise = await exerciseRes.json();

      console.log("EXERCISE RESPONSE:", exercise);

      if (!exerciseRes.ok) {
        alert(
          exercise.message ||
            exercise.error ||
            "Could not create exercise"
        );
        return;
      }

      // =================================================
      // STEP 2: ADD EXERCISE TO WORKOUT
      // =================================================

      const workoutExerciseRes = await fetch(
        `${API}/workout-exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workout_id: selectedWorkout.id,

            // Some APIs return exercise.id
            // and some return exercise_id.
            exercise_id:
              exercise.id ?? exercise.exercise_id,
          }),
        }
      );

      const workoutExercise =
        await workoutExerciseRes.json();

      console.log(
        "WORKOUT EXERCISE RESPONSE:",
        workoutExercise
      );

      if (!workoutExerciseRes.ok) {
        alert(
          workoutExercise.message ||
            workoutExercise.error ||
            "Could not add exercise to workout"
        );
        return;
      }

      // =================================================
      // IMPORTANT:
      // GET THE WORKOUT_EXERCISE ID
      // =================================================

      const workoutExerciseId =
        workoutExercise.id ??
        workoutExercise.workout_exercise_id ??
        workoutExercise.data?.id ??
        workoutExercise.data?.workout_exercise_id;

      console.log(
        "WORKOUT EXERCISE ID:",
        workoutExerciseId
      );

      // If backend didn't return an ID,
      // DON'T try inserting a set.
      if (!workoutExerciseId) {
        console.error(
          "Workout exercise response did not contain an ID:",
          workoutExercise
        );

        alert(
          "Exercise was created, but workout exercise ID was not returned."
        );

        return;
      }

      // =================================================
      // STEP 3: ADD FIRST SET
      // =================================================

      const setRes = await fetch(
        `${API}/workout-sets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workout_exercise_id: workoutExerciseId,
            set_number: 1,
            weight: weightNumber,
            reps: repsNumber,
          }),
        }
      );

      const setData = await setRes.json();

      console.log("FIRST SET RESPONSE:", setData);

      if (!setRes.ok) {
        alert(
          setData.message ||
            setData.error ||
            "Exercise created, but first set could not be saved"
        );
        return;
      }

      // =================================================
      // RESET FORM
      // =================================================

      setExerciseName("");
      setWeight("");
      setReps("");

      // Reload workout so new exercise + set appear
      await openWorkout(selectedWorkout.id);

      alert("Exercise and Set added successfully!");
    } catch (error) {
      console.error("ADD EXERCISE ERROR:", error);
      alert("Backend connection failed");
    }
  }

  // =====================================================
  // UPDATE SET INPUT
  // =====================================================

  function updateSetInput(
    exerciseId,
    field,
    value
  ) {
    setSetInputs((previous) => ({
      ...previous,

      [exerciseId]: {
        ...previous[exerciseId],
        [field]: value,
      },
    }));
  }

  // =====================================================
  // ADD ANOTHER SET
  // =====================================================

  async function addSet(exercise) {
    const workoutExerciseId =
      exercise.workout_exercise_id;

    if (!workoutExerciseId) {
      console.error(
        "Missing workout_exercise_id:",
        exercise
      );

      alert("Workout exercise ID is missing");
      return;
    }

    const input =
      setInputs[workoutExerciseId] || {};

    if (
      input.weight === "" ||
      input.weight === undefined
    ) {
      alert("Enter weight");
      return;
    }

    if (
      input.reps === "" ||
      input.reps === undefined
    ) {
      alert("Enter reps");
      return;
    }

    const weightNumber = Number(input.weight);
    const repsNumber = Number(input.reps);

    if (
      !Number.isFinite(weightNumber) ||
      weightNumber < 0 ||
      !Number.isFinite(repsNumber) ||
      repsNumber <= 0
    ) {
      alert("Enter valid weight and reps");
      return;
    }

    // Next set number
    const nextSetNumber =
      exercise.sets.length + 1;

    try {
      const res = await fetch(
        `${API}/workout-sets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workout_exercise_id:
              workoutExerciseId,
            set_number: nextSetNumber,
            weight: weightNumber,
            reps: repsNumber,
          }),
        }
      );

      const data = await res.json();

      console.log("ADD SET RESPONSE:", data);

      if (!res.ok) {
        alert(
          data.message ||
            data.error ||
            "Could not add set"
        );
        return;
      }

      // Clear inputs for this exercise
      setSetInputs((previous) => ({
        ...previous,

        [workoutExerciseId]: {
          weight: "",
          reps: "",
        },
      }));

      // Reload workout
      await openWorkout(selectedWorkout.id);

      alert(`Set ${nextSetNumber} added!`);
    } catch (error) {
      console.error("ADD SET ERROR:", error);
      alert("Backend connection failed");
    }
  }

  // =====================================================
  // GROUP EXERCISES + SETS
  // =====================================================

  function groupExercises(exercises) {
    const groups = {};

    exercises.forEach((exercise) => {
      const id =
        exercise.workout_exercise_id;

      if (!id) {
        console.warn(
          "Exercise missing workout_exercise_id:",
          exercise
        );
        return;
      }

      if (!groups[id]) {
        groups[id] = {
          workout_exercise_id: id,

          exercise_name:
            exercise.exercise_name,

          muscle_group:
            exercise.muscle_group,

          sets: [],
        };
      }

      if (
        exercise.set_number !== null &&
        exercise.set_number !== undefined
      ) {
        groups[id].sets.push({
          set_number:
            exercise.set_number,

          weight:
            exercise.weight,

          reps:
            exercise.reps,
        });
      }
    });

    return Object.values(groups);
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header>
        <h1>GYM TRACKER</h1>

        <p>
          Track your workouts. Track your progress.
        </p>
      </header>

      <main>

        {/* =================================================
            WORKOUT LIST
        ================================================= */}

        {!selectedWorkout ? (
          <>
            {/* CREATE WORKOUT */}

            <section className="card">

              <h2>Create Workout</h2>

              <form onSubmit={createWorkout}>

                <input
                  type="text"
                  placeholder="Workout name (e.g. Chest Day)"
                  value={workoutName}
                  onChange={(e) =>
                    setWorkoutName(
                      e.target.value
                    )
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "Create Workout"}
                </button>

              </form>

            </section>

            {/* MY WORKOUTS */}

            <section className="card">

              <h2>My Workouts</h2>

              {workouts.length === 0 ? (

                <p>
                  No workouts yet.
                  Create your first workout.
                </p>

              ) : (

                <div className="workout-list">

                  {workouts.map(
                    (workout) => (

                      <div
                        className="workout"
                        key={workout.id}
                        onClick={() =>
                          openWorkout(
                            workout.id
                          )
                        }
                      >

                        <div>

                          <h3>
                            {workout.name}
                          </h3>

                          <p>
                            {workout.workout_date
                              ? new Date(
                                  workout.workout_date
                                ).toLocaleDateString()
                              : ""}
                          </p>

                        </div>

                        <span>→</span>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>
          </>
        ) : (

          /* =================================================
             SELECTED WORKOUT
          ================================================= */

          <section className="card">

            {/* BACK BUTTON */}

            <button
              className="back"
              onClick={() =>
                setSelectedWorkout(null)
              }
            >
              ← Back
            </button>

            <h2>
              Workout #{selectedWorkout.id}
            </h2>

            {/* =================================================
                ADD EXERCISE FORM
            ================================================= */}

            <form
              onSubmit={addExercise}
            >

              <input
                type="text"
                placeholder="Exercise name"
                value={exerciseName}
                onChange={(e) =>
                  setExerciseName(
                    e.target.value
                  )
                }
              />

              <select
                value={muscleGroup}
                onChange={(e) =>
                  setMuscleGroup(
                    e.target.value
                  )
                }
              >

                <option>Chest</option>
                <option>Back</option>
                <option>Shoulders</option>
                <option>Arms</option>
                <option>Legs</option>
                <option>Abs</option>

              </select>

              <input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                min="0"
                step="0.5"
                onChange={(e) =>
                  setWeight(
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                placeholder="Reps"
                value={reps}
                min="1"
                step="1"
                onChange={(e) =>
                  setReps(
                    e.target.value
                  )
                }
              />

              <button type="submit">
                Add Exercise
              </button>

            </form>

            {/* =================================================
                EXERCISES
            ================================================= */}

            <h2>Exercises</h2>

            {selectedWorkout.exercises.length ===
            0 ? (

              <p>
                No exercises added yet.
              </p>

            ) : (

              groupExercises(
                selectedWorkout.exercises
              ).map((exercise) => {

                const input =
                  setInputs[
                    exercise
                      .workout_exercise_id
                  ] || {};

                return (

                  <div
                    className="exercise"
                    key={
                      exercise
                        .workout_exercise_id
                    }
                  >

                    <div>

                      {/* EXERCISE NAME */}

                      <h3>
                        {exercise.exercise_name}
                      </h3>

                      {/* MUSCLE GROUP */}

                      <p>
                        {exercise.muscle_group}
                      </p>

                      {/* =================================================
                          EXISTING SETS
                      ================================================= */}

                      {exercise.sets.length ===
                      0 ? (

                        <p>
                          No sets recorded yet.
                        </p>

                      ) : (

                        exercise.sets.map(
                          (set) => (

                            <p
                              key={
                                set.set_number
                              }
                            >

                              Set{" "}
                              {set.set_number}
                              :{" "}

                              {Number(
                                set.weight
                              ).toFixed(2)}

                              {" "}kg ×{" "}

                              {set.reps}

                            </p>

                          )
                        )

                      )}

                      {/* =================================================
                          ADD NEXT SET
                      ================================================= */}

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "15px",
                          flexWrap: "wrap",
                        }}
                      >

                        {/* WEIGHT */}

                        <input
                          type="number"
                          placeholder="Weight (kg)"
                          min="0"
                          step="0.5"
                          value={
                            input.weight ||
                            ""
                          }
                          onChange={(e) =>
                            updateSetInput(
                              exercise
                                .workout_exercise_id,
                              "weight",
                              e.target.value
                            )
                          }
                        />

                        {/* REPS */}

                        <input
                          type="number"
                          placeholder="Reps"
                          min="1"
                          step="1"
                          value={
                            input.reps ||
                            ""
                          }
                          onChange={(e) =>
                            updateSetInput(
                              exercise
                                .workout_exercise_id,
                              "reps",
                              e.target.value
                            )
                          }
                        />

                        {/* ADD SET */}

                        <button
                          type="button"
                          onClick={() =>
                            addSet(
                              exercise
                            )
                          }
                        >
                          + Add Set
                        </button>

                      </div>

                    </div>

                  </div>

                );
              })

            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default App;