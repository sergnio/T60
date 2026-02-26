import type { Exercise } from "./stories/WorkoutCardT18";
import { WorkoutCardT18 } from "./stories/WorkoutCardT18";
import { useActiveSessionWithParticipants } from "./hooks/queries/useWorkflowQueries.ts";
import { useCompleteSet } from "./hooks/mutations/useSetMutations.ts";
import type { ParticipantWithSets } from "./db/types.ts";

/**
 * Map database participant data to Exercise format for WorkoutCard
 */
function mapParticipantToExercise(
  participant: ParticipantWithSets,
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
  };
}

const App = () => {
  const { data: session, isLoading, error } = useActiveSessionWithParticipants();
  const completeSetMutation = useCompleteSet();

  // Handle set completion
  const handleSetComplete = (participantId: string, setIndex: number) => {
    const participant = session?.participants.find((p) => p.id === participantId);
    if (!participant) return;

    const set = participant.sets.find((s) => s.set_index === setIndex);
    if (set && !set.completed) {
      completeSetMutation.mutate(set.id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex w-screen h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Loading workout session...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex w-screen h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
          Error loading session: {error.message}
        </div>
      </div>
    );
  }

  // No active session
  if (!session) {
    return (
      <div className="flex flex-col gap-4 w-screen h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          No active workout session
        </div>
        <button
          onClick={() => window.database.seedDatabase()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Seed Database
        </button>
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
    <div className="flex flex-col gap-10 w-screen h-screen bg-gray-50 dark:bg-gray-900 p-10 items-center justify-center">
      {/* Session name */}
      {session.name && (
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          {session.name}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full max-w-[90vw]">
        {/* Active participants - Top row */}
        {activeParticipants.map((participant) => {
          const exercise = mapParticipantToExercise(participant);
          return (
            <div key={participant.id} className="flex flex-col gap-3">
              <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center">
                {exercise.name}
              </div>
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
