import { useState } from "react";
import type { Exercise } from "./stories/WorkoutCardT18";
import { WorkoutCardT18 } from "./stories/WorkoutCardT18";
import { useActiveSessionWithParticipants } from "./hooks/queries/useWorkflowQueries.ts";
import { useAllExercises } from "./hooks/queries/useExercises.ts";
import { useCompleteSet } from "./hooks/mutations/useSetMutations.ts";
import type { ParticipantWithSets, Exercise as DbExercise } from "./db/types.ts";
import { SessionCreationForm } from "./components/SessionCreationForm.tsx";
import { MaxWeightManager } from "./components/MaxWeightManager.tsx";
import { WorkoutTimer } from "./components/WorkoutTimer.tsx";
import styles from "./App.module.scss";

/**
 * Map database participant data to Exercise format for WorkoutCard
 */
function mapParticipantToExercise(
  participant: ParticipantWithSets,
  barWeight: number = 45,
): Exercise {
  return {
    name: participant.exercise_name,
    weightUnit: participant.weight_unit,
    sets: participant.sets
      .sort((a, b) => a.set_index - b.set_index)
      .map((set) => ({
        weight: set.weight,
        completed: set.completed,
      })),
    currentSetIndex: participant.current_set_index,
    barWeight,
  };
}

/**
 * Group participants by exercise_name into station columns
 */
function groupByExercise(
  participants: ParticipantWithSets[],
): { exerciseName: string; participants: ParticipantWithSets[] }[] {
  const map = new Map<string, ParticipantWithSets[]>();
  for (const p of participants) {
    const key = p.exercise_name;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(p);
  }
  return Array.from(map.entries()).map(([exerciseName, participants]) => ({
    exerciseName,
    participants,
  }));
}

const App = () => {
  const [showMaxWeights, setShowMaxWeights] = useState(false);
  const {
    data: session,
    isLoading,
    error,
  } = useActiveSessionWithParticipants();
  const { data: exercises = [] } = useAllExercises();
  const completeSetMutation = useCompleteSet();

  // Build a lookup map for exercise bar weights so we can pass them to WorkoutCard
  const exerciseBarWeightMap = new Map<string, number>(
    exercises.map((ex: DbExercise) => [ex.id, ex.bar_weight ?? 0]),
  );

  // Handle set completion
  const handleSetComplete = (participantId: string, setIndex: number) => {
    const participant = session?.participants.find(
      (p) => p.id === participantId,
    );
    if (!participant) return;

    const set = participant.sets.find((s) => s.set_index === setIndex);
    if (set && !set.completed) {
      completeSetMutation.mutate(set.id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.fullscreenCenter}>
        <div className={styles.loadingText}>Loading workout session...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.fullscreenCenter}>
        <div className={styles.errorText}>
          Error loading session: {error.message}
        </div>
      </div>
    );
  }

  // No active session
  if (!session) {
    return (
      <div className={styles.fullscreenCenter}>
        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleButton} ${!showMaxWeights ? styles.active : ""}`}
            onClick={() => setShowMaxWeights(false)}
          >
            New Session
          </button>
          <button
            className={`${styles.toggleButton} ${showMaxWeights ? styles.active : ""}`}
            onClick={() => setShowMaxWeights(true)}
          >
            Max Weights
          </button>
        </div>
        {showMaxWeights ? <MaxWeightManager /> : <SessionCreationForm />}
      </div>
    );
  }

  // Filter to only active participants and sort by ID for consistent ordering
  // IMPORTANT: Display sort and is_active assignment both use id.localeCompare
  // to ensure the visually-top participant is the active one. See TONY-80.
  const activeParticipants = session.participants.filter(p => p.status === "active");
  const sortedParticipants = [...activeParticipants].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const stations = groupByExercise(sortedParticipants);

  return (
    <div className={styles.container}>
      {/* Timer - pass ALL participants (including pending) for rotation detection */}
      <WorkoutTimer participants={session.participants} />
      {/* Session name */}
      {session.name && (
        <div className={styles.sessionTitle}>{session.name}</div>
      )}

      <div
        className={styles.stationGrid}
        style={{
          gridTemplateColumns: `repeat(${stations.length}, 1fr)`,
        }}
      >
        {stations.map((station) => (
          <div key={station.exerciseName} className={styles.stationColumn}>
            <div className={styles.exerciseTitle}>{station.exerciseName}</div>
            {station.participants.map((participant) => {
              const { id, is_active } = participant;
              const barWt = participant.exercise_id
                ? (exerciseBarWeightMap.get(participant.exercise_id) ?? 45)
                : 45;
              const exercise = mapParticipantToExercise(participant, barWt);
              return (
                <WorkoutCardT18
                  key={id}
                  personName={participant.person.name.toUpperCase()}
                  exercise={exercise}
                  isActive={is_active}
                  onSetComplete={(setIndex) => handleSetComplete(id, setIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
