import { useState } from "react";
import { useAllPeople } from "../hooks/queries/usePeople.ts";
import { useAllExercises } from "../hooks/queries/useExercises.ts";
import { usePersonMaxWeights } from "../hooks/queries/useMaxWeights.ts";
import {
  useSetPersonMaxWeight,
  useDeletePersonMaxWeight,
} from "../hooks/mutations/useMaxWeightMutations.ts";
import { MaxWeightEditForm } from "./MaxWeightEditForm.tsx";
import type { WeightUnit } from "../db/types.ts";
import styles from "./MaxWeightManager.module.scss";

export function MaxWeightManager() {
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [editingExerciseId, setEditingExerciseId] = useState<string>("");
  const [editWeight, setEditWeight] = useState<string>("");
  const [editUnit, setEditUnit] = useState<WeightUnit>("lbs");

  const { data: people = [], isLoading: isPeopleLoading } = useAllPeople();
  const { data: exercises = [], isLoading: isExercisesLoading } =
    useAllExercises();
  const { data: maxWeights = [] } = usePersonMaxWeights(selectedPersonId);

  const setMaxWeight = useSetPersonMaxWeight();
  const deleteMaxWeight = useDeletePersonMaxWeight();

  const handleSelectPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setEditingExerciseId("");
    setEditWeight("");
  };

  const handleStartEdit = (exerciseId: string) => {
    const existing = maxWeights.find((mw) => mw.exercise_id === exerciseId);
    setEditingExerciseId(exerciseId);
    setEditWeight(existing ? String(existing.max_weight) : "");
    setEditUnit(existing ? existing.weight_unit : "lbs");
  };

  const handleSaveMaxWeight = async (exerciseId: string) => {
    const weight = parseFloat(editWeight);
    if (!selectedPersonId || !weight || weight <= 0) return;

    try {
      await setMaxWeight.mutateAsync({
        personId: selectedPersonId,
        exerciseId,
        maxWeight: weight,
        weightUnit: editUnit,
      });
      setEditingExerciseId("");
      setEditWeight("");
    } catch {
      // Mutation error handled by UI
    }
  };

  const handleDelete = async (exerciseId: string) => {
    if (!selectedPersonId) return;

    try {
      await deleteMaxWeight.mutateAsync({
        personId: selectedPersonId,
        exerciseId,
      });
    } catch {
      // Mutation error handled by UI
    }
  };

  const handleCancel = () => {
    setEditingExerciseId("");
    setEditWeight("");
  };

  if (isPeopleLoading || isExercisesLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Max Weight Manager</h1>

      <div className={styles.layout}>
        {/* Left: Person List */}
        <div className={styles.peopleList}>
          <h2 className={styles.sectionTitle}>People</h2>
          <div className={styles.peopleCards}>
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => handleSelectPerson(person.id)}
                className={`${styles.personCard} ${selectedPersonId === person.id ? styles.selected : ""}`}
              >
                {person.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Max Weights */}
        <div className={styles.maxWeightsSection}>
          {selectedPersonId ? (
            <>
              <h2 className={styles.sectionTitle}>
                {selectedPerson?.name}'s Max Weights
              </h2>
              <div className={styles.exercises}>
                {exercises.map((exercise) => {
                  const maxWeight = maxWeights.find(
                    (mw) => mw.exercise_id === exercise.id,
                  );
                  const isEditing = editingExerciseId === exercise.id;

                  return (
                    <div key={exercise.id} className={styles.exerciseRow}>
                      <div className={styles.exerciseName}>{exercise.name}</div>

                      {!isEditing && (
                        <>
                          <div className={styles.maxWeightDisplay}>
                            {maxWeight
                              ? `${maxWeight.max_weight} ${maxWeight.weight_unit}`
                              : "Not set"}
                          </div>
                          <div className={styles.actions}>
                            <button
                              onClick={() => handleStartEdit(exercise.id)}
                              className={styles.editButton}
                            >
                              {maxWeight ? "Edit" : "Set"}
                            </button>
                            {maxWeight && (
                              <button
                                onClick={() => handleDelete(exercise.id)}
                                className={styles.deleteButton}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </>
                      )}

                      {isEditing && (
                        <div className={styles.editFormWrapper}>
                          <MaxWeightEditForm
                            weight={editWeight}
                            unit={editUnit}
                            onWeightChange={setEditWeight}
                            onUnitChange={setEditUnit}
                            onSave={() => handleSaveMaxWeight(exercise.id)}
                            onCancel={handleCancel}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              Select a person to view and edit their max weights
            </div>
          )}
        </div>
      </div>
    </div>
  );
}