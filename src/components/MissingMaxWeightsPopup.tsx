import { useState, useEffect } from "react";
import { useAllExercises } from "../hooks/queries/useExercises.ts";
import { usePersonMaxWeights } from "../hooks/queries/useMaxWeights.ts";
import { useSetPersonMaxWeight } from "../hooks/mutations/useMaxWeightMutations.ts";
import { MaxWeightEditForm } from "./MaxWeightEditForm.tsx";
import type { WeightUnit, Person } from "../db/types.ts";
import styles from "./MissingMaxWeightsPopup.module.scss";

interface MissingMaxWeight {
  personId: string;
  exerciseId: string;
}

interface MissingMaxWeightsPopupProps {
  missingMaxWeights: MissingMaxWeight[];
  people: Person[];
  onClose: () => void;
  onCancel: () => void;
}

export function MissingMaxWeightsPopup({
  missingMaxWeights,
  people,
  onClose,
  onCancel,
}: MissingMaxWeightsPopupProps) {
  const { data: exercises = [] } = useAllExercises();
  const setMaxWeight = useSetPersonMaxWeight();

  const [editingKey, setEditingKey] = useState<string>("");
  const [editWeight, setEditWeight] = useState<string>("");
  const [editUnit, setEditUnit] = useState<WeightUnit>("lbs");

  // Group missing max weights by person
  const missingByPerson = new Map<string, Set<string>>();
  for (const { personId, exerciseId } of missingMaxWeights) {
    if (!missingByPerson.has(personId)) {
      missingByPerson.set(personId, new Set());
    }
    missingByPerson.get(personId)!.add(exerciseId);
  }

  // Track which max weights have been set by fetching each person's max weights
  const personMaxWeightsQueries = Array.from(missingByPerson.keys()).map(
    (personId) => ({
      personId,
      query: usePersonMaxWeights(personId),
    })
  );

  // Calculate remaining missing max weights
  const remainingMissing: MissingMaxWeight[] = [];
  for (const [personId, exerciseIds] of missingByPerson.entries()) {
    const personQuery = personMaxWeightsQueries.find(
      (q) => q.personId === personId
    );
    const maxWeights = personQuery?.query.data || [];
    const maxWeightExerciseIds = new Set(
      maxWeights.map((mw) => mw.exercise_id)
    );

    for (const exerciseId of exerciseIds) {
      if (!maxWeightExerciseIds.has(exerciseId)) {
        remainingMissing.push({ personId, exerciseId });
      }
    }
  }

  // Close popup when all max weights are filled
  useEffect(() => {
    if (remainingMissing.length === 0 && missingMaxWeights.length > 0) {
      onClose();
    }
  }, [remainingMissing.length, missingMaxWeights.length, onClose]);

  const handleStartEdit = (personId: string, exerciseId: string) => {
    const key = `${personId}:${exerciseId}`;
    const personQuery = personMaxWeightsQueries.find(
      (q) => q.personId === personId
    );
    const maxWeights = personQuery?.query.data || [];
    const existing = maxWeights.find((mw) => mw.exercise_id === exerciseId);

    setEditingKey(key);
    setEditWeight(existing ? String(existing.max_weight) : "");
    setEditUnit(existing ? existing.weight_unit : "lbs");
  };

  const handleSaveMaxWeight = async (personId: string, exerciseId: string) => {
    const weight = parseFloat(editWeight);
    if (!weight || weight <= 0) return;

    try {
      await setMaxWeight.mutateAsync({
        personId,
        exerciseId,
        maxWeight: weight,
        weightUnit: editUnit,
      });
      setEditingKey("");
      setEditWeight("");
    } catch {
      // Mutation error handled by UI
    }
  };

  const handleCancel = () => {
    setEditingKey("");
    setEditWeight("");
  };

  const getPersonName = (personId: string) =>
    people.find((p) => p.id === personId)?.name || "Unknown";

  const getExerciseName = (exerciseId: string) =>
    exercises.find((e) => e.id === exerciseId)?.name || "Unknown";

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h2 className={styles.title}>Max Weights Required</h2>
          <p className={styles.subtitle}>
            The following people need their max weights set before starting the
            workout:
          </p>
        </div>

        <div className={styles.content}>
          {Array.from(missingByPerson.entries()).map(
            ([personId, exerciseIds]) => {
              const personQuery = personMaxWeightsQueries.find(
                (q) => q.personId === personId
              );
              const maxWeights = personQuery?.query.data || [];
              const maxWeightExerciseIds = new Set(
                maxWeights.map((mw) => mw.exercise_id)
              );

              // Filter to only show exercises that still need max weights
              const stillMissingExerciseIds = Array.from(exerciseIds).filter(
                (exerciseId) => !maxWeightExerciseIds.has(exerciseId)
              );

              // Don't show this person if all their max weights are set
              if (stillMissingExerciseIds.length === 0) return null;

              return (
                <div key={personId} className={styles.personSection}>
                  <h3 className={styles.personName}>{getPersonName(personId)}</h3>
                  <div className={styles.exerciseList}>
                    {stillMissingExerciseIds.map((exerciseId) => {
                      const key = `${personId}:${exerciseId}`;
                      const isEditing = editingKey === key;

                      return (
                        <div key={exerciseId} className={styles.exerciseRow}>
                          <div className={styles.exerciseName}>
                            {getExerciseName(exerciseId)}
                          </div>

                          {!isEditing && (
                            <button
                              onClick={() => handleStartEdit(personId, exerciseId)}
                              className={styles.setButton}
                            >
                              Set Max Weight
                            </button>
                          )}

                          {isEditing && (
                            <MaxWeightEditForm
                              weight={editWeight}
                              unit={editUnit}
                              onWeightChange={setEditWeight}
                              onUnitChange={setEditUnit}
                              onSave={() => handleSaveMaxWeight(personId, exerciseId)}
                              onCancel={handleCancel}
                              autoFocus
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onCancel} className={styles.closeButton}>
            Cancel Workout Creation
          </button>
        </div>
      </div>
    </div>
  );
}