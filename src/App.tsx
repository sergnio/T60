import type { Exercise } from "./stories/WorkoutCardT18";
import { WorkoutCardT18 } from "./stories/WorkoutCardT18";
import { useActiveSessionWithParticipants } from "./hooks/queries/useWorkflowQueries.ts";
import { useCompleteSet } from "./hooks/mutations/useSetMutations.ts";
import type { ParticipantWithSets } from "./db/types.ts";
import { SessionCreationForm } from "./components/SessionCreationForm.tsx";
import styles from "./App.module.scss";

/**
 * Map database participant data to Exercise format for WorkoutCard
 */
function mapParticipantToExercise(participant: ParticipantWithSets): Exercise {
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
  };
}

const App = () => {
  const {
    data: session,
    isLoading,
    error,
  } = useActiveSessionWithParticipants();
  console.log("session", session);
  console.log("erro", error);
  const completeSetMutation = useCompleteSet();

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
      <div className="flex w-screen h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <SessionCreationForm />
      </div>
    );
  }

  // Split participants into active and resting
  const activeParticipants = session.participants
    .filter((p) => p.is_active)
    .slice(0, 3);
  const restingParticipants = session.participants
    .filter((p) => !p.is_active)
    .slice(0, 3);

  return (
    <div className={styles.container}>
      {/* Session name */}
      {session.name && (
        <div className={styles.sessionTitle}>{session.name}</div>
      )}

      <div className={styles.grid}>
        {/* Active participants - Top row */}
        {activeParticipants.map((participant) => {
          const exercise = mapParticipantToExercise(participant);
          return (
            <div key={participant.id} className={styles.exerciseWrapper}>
              <div className={styles.exerciseTitle}>{exercise.name}</div>
              <WorkoutCardT18
                personName={participant.person.name.toUpperCase()}
                exercise={exercise}
                isActive
                onSetComplete={(setIndex) =>
                  handleSetComplete(participant.id, setIndex)
                }
              />
            </div>
          );
        })}

        {/* Resting participants - Bottom row */}
        {restingParticipants.map((participant) => {
          const exercise = mapParticipantToExercise(participant);
          return (
            <WorkoutCardT18
              key={participant.id}
              personName={participant.person.name.toUpperCase()}
              exercise={exercise}
              isActive={false}
              onSetComplete={(setIndex) =>
                handleSetComplete(participant.id, setIndex)
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default App;
