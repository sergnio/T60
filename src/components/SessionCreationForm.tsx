import { useState } from "react";
import { useAllPeople } from "../hooks/queries/usePeople.ts";
import { useCreateWorkoutSession } from "../hooks/mutations/useWorkoutSessionMutations.ts";

export function SessionCreationForm() {
  const { data: people = [], isLoading: isPeopleLoading } = useAllPeople();
  const createSession = useCreateWorkoutSession();

  const [selectedPeopleIds, setSelectedPeopleIds] = useState<Set<string>>(
    new Set(),
  );
  const [exerciseName, setExerciseName] = useState("");

  const isValid =
    selectedPeopleIds.size > 0 && exerciseName.trim().length > 0;

  const handleTogglePerson = (personId: string) => {
    setSelectedPeopleIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(personId)) {
        newSet.delete(personId);
      } else {
        newSet.add(personId);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    createSession.mutate({
      exerciseName: exerciseName.trim(),
      weightUnit: "lbs",
      participantIds: Array.from(selectedPeopleIds),
    });
  };

  if (isPeopleLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Start New Workout
        </h2>

        {/* Exercise Name Input */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="exercise-name"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Exercise Name
          </label>
          <input
            id="exercise-name"
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g., Bench Press"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={createSession.isPending}
          />
        </div>

        {/* Participant Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Participants
          </label>
          <div className="flex flex-col gap-2">
            {people.map((person) => (
              <label
                key={person.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedPeopleIds.has(person.id)}
                  onChange={() => handleTogglePerson(person.id)}
                  disabled={createSession.isPending}
                  className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-base text-gray-900 dark:text-white">
                  {person.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {createSession.isError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              Failed to create session. Please try again.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || createSession.isPending}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {createSession.isPending ? "Starting..." : "Start Session"}
        </button>
      </form>
    </div>
  );
}
