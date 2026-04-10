import { useState } from "react";
import { useAllPeople } from "../hooks/queries/usePeople.ts";
import { useAllExercises } from "../hooks/queries/useExercises.ts";
import { useCreateWorkoutSession } from "../hooks/mutations/useWorkoutSessionMutations.ts";
import { useCreateExercise } from "../hooks/mutations/useExerciseMutations.ts";
import { MissingMaxWeightsPopup } from "./MissingMaxWeightsPopup.tsx";
import type { ExerciseStation } from "../db/types.ts";
import styles from "./SessionCreationForm.module.scss";

interface StationState {
  exerciseId: string;
  exerciseName: string;
  participantIds: Set<string>;
}

export function SessionCreationForm() {
  const { data: people = [], isLoading: isPeopleLoading } = useAllPeople();
  const { data: exercises = [], isLoading: isExercisesLoading } =
    useAllExercises();
  const createSession = useCreateWorkoutSession();
  const createExercise = useCreateExercise();

  const [stations, setStations] = useState<StationState[]>([]);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customBarWeight, setCustomBarWeight] = useState<string>("");
  const [missingMaxWeights, setMissingMaxWeights] = useState<
    { personId: string; exerciseId: string }[]
  >([]);
  const [showMissingMaxWeightsPopup, setShowMissingMaxWeightsPopup] =
    useState(false);
  const [pendingStationInputs, setPendingStationInputs] = useState<
    ExerciseStation[] | null
  >(null);

  // All person IDs already assigned to a station
  const assignedPersonIds = new Set(
    stations.flatMap((s) => Array.from(s.participantIds)),
  );

  // Exercises already selected as stations
  const selectedExerciseIds = new Set(stations.map((s) => s.exerciseId));

  const isValid =
    stations.length > 0 && stations.some((s) => s.participantIds.size >= 1);

  const handleSelectExercise = (exerciseId: string, exerciseName: string) => {
    if (selectedExerciseIds.has(exerciseId)) {
      // Remove station
      setStations((prev) => prev.filter((s) => s.exerciseId !== exerciseId));
    } else {
      // Add station
      setStations((prev) => [
        ...prev,
        { exerciseId, exerciseName, participantIds: new Set() },
      ]);
    }
  };

  const handleAddCustomExercise = async () => {
    const name = customExerciseName.trim();
    if (!name) return;

    // Parse bar weight — empty string means user hasn't set it, which is allowed
    // at creation time (they can set it later in MaxWeightManager)
    const parsedBarWeight = customBarWeight.trim() === ""
      ? null
      : parseFloat(customBarWeight);

    try {
      const exercise = await createExercise.mutateAsync({
        name,
        bar_weight: parsedBarWeight,
      });
      setStations((prev) => [
        ...prev,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          participantIds: new Set(),
        },
      ]);
      setCustomExerciseName("");
      setCustomBarWeight("");
    } catch {
      // mutation error handled by UI
    }
  };

  const handleRemoveStation = (exerciseId: string) => {
    setStations((prev) => prev.filter((s) => s.exerciseId !== exerciseId));
  };

  const handleTogglePersonForStation = (
    exerciseId: string,
    personId: string,
  ) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.exerciseId !== exerciseId) return s;
        const newIds = new Set(s.participantIds);
        if (newIds.has(personId)) {
          newIds.delete(personId);
        } else {
          newIds.add(personId);
        }
        return { ...s, participantIds: newIds };
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const stationInputs: ExerciseStation[] = stations.map((s) => ({
      exerciseId: s.exerciseId,
      participantIds: Array.from(s.participantIds),
    }));

    setPendingStationInputs(stationInputs);

    createSession.mutate(
      {
        weightUnit: "lbs",
        stations: stationInputs,
      },
      {
        onError: (error: any) => {
          console.log("[SessionCreationForm] Error creating session:", error);

          // Check if it's a missing max weight error
          // The error message format from the service is: "Max weight not found for participant"
          if (error?.message?.includes("Max weight not found")) {
            // Build list of ALL person+exercise combinations since participants rotate through all exercises
            // We need to check every participant against every exercise in the workout
            const missing: { personId: string; exerciseId: string }[] = [];

            // Get all unique participants and exercises
            const allParticipantIds = new Set<string>();
            const allExerciseIds = new Set<string>();

            for (const station of stationInputs) {
              allExerciseIds.add(station.exerciseId);
              for (const personId of station.participantIds) {
                allParticipantIds.add(personId);
              }
            }

            // Create all combinations (Cartesian product)
            for (const personId of allParticipantIds) {
              for (const exerciseId of allExerciseIds) {
                missing.push({
                  personId,
                  exerciseId,
                });
              }
            }

            console.log("[SessionCreationForm] Missing max weights:", missing);
            setMissingMaxWeights(missing);
            setShowMissingMaxWeightsPopup(true);
          }
        },
      },
    );
  };

  const handleMissingMaxWeightsClose = () => {
    // Just close the popup - user can manually click "Start Session" again
    setShowMissingMaxWeightsPopup(false);
    setMissingMaxWeights([]);
    setPendingStationInputs(null);
  };

  const handleMissingMaxWeightsCancel = () => {
    setShowMissingMaxWeightsPopup(false);
    setMissingMaxWeights([]);
    setPendingStationInputs(null);
  };

  if (isPeopleLoading || isExercisesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Start New Workout</h2>

        {/* Exercise Picker */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Select Exercises</span>
          <div className={styles.exerciseGrid}>
            {exercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                className={`${styles.exerciseChip} ${selectedExerciseIds.has(ex.id) ? styles.selected : ""}`}
                onClick={() => handleSelectExercise(ex.id, ex.name)}
                disabled={createSession.isPending}
              >
                {ex.name}
              </button>
            ))}
          </div>

          {/* Custom exercise */}
          <div className={styles.customExerciseRow}>
            <input
              type="text"
              value={customExerciseName}
              onChange={(e) => setCustomExerciseName(e.target.value)}
              placeholder="Custom exercise..."
              className={styles.customExerciseInput}
              disabled={createSession.isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomExercise();
                }
              }}
            />
            <input
              type="number"
              value={customBarWeight}
              onChange={(e) => setCustomBarWeight(e.target.value)}
              placeholder="Bar (lbs)"
              className={styles.barWeightInput}
              disabled={createSession.isPending}
              min="0"
              step="5"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomExercise();
                }
              }}
            />
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddCustomExercise}
              disabled={
                !customExerciseName.trim() ||
                createExercise.isPending ||
                createSession.isPending
              }
            >
              {createExercise.isPending ? "..." : "Add"}
            </button>
          </div>
        </div>

        {/* Station Assignments */}
        {stations.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              Assign People to Stations
            </span>
            <div className={styles.stationList}>
              {stations.map((station) => (
                <div key={station.exerciseId} className={styles.stationCard}>
                  <div className={styles.stationHeader}>
                    <span className={styles.stationName}>
                      {station.exerciseName}
                    </span>
                    <button
                      type="button"
                      className={styles.removeStation}
                      onClick={() => handleRemoveStation(station.exerciseId)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className={styles.peoplePicker}>
                    {people.map((person) => {
                      const isSelected = station.participantIds.has(person.id);
                      const isAssignedElsewhere =
                        !isSelected && assignedPersonIds.has(person.id);
                      return (
                        <button
                          key={person.id}
                          type="button"
                          className={`${styles.personChip} ${isSelected ? styles.selected : ""}`}
                          onClick={() =>
                            handleTogglePersonForStation(
                              station.exerciseId,
                              person.id,
                            )
                          }
                          disabled={
                            isAssignedElsewhere || createSession.isPending
                          }
                        >
                          {person.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {createSession.isError && (
          <div className={styles.error}>
            <p className={styles.errorText}>
              Failed to create session. Please try again.
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || createSession.isPending}
          className={styles.submitButton}
        >
          {createSession.isPending ? "Starting..." : "Start Session"}
        </button>
      </form>

      {/* Missing Max Weights Popup */}
      {showMissingMaxWeightsPopup && (
        <MissingMaxWeightsPopup
          missingMaxWeights={missingMaxWeights}
          people={people}
          onClose={handleMissingMaxWeightsClose}
          onCancel={handleMissingMaxWeightsCancel}
        />
      )}
    </div>
  );
}
