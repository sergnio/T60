import type { WeightUnit } from "../db/types.ts";
import styles from "./MaxWeightEditForm.module.scss";

interface MaxWeightEditFormProps {
  weight: string;
  unit: WeightUnit;
  onWeightChange: (weight: string) => void;
  onUnitChange: (unit: WeightUnit) => void;
  onSave: () => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export function MaxWeightEditForm({
  weight,
  unit,
  onWeightChange,
  onUnitChange,
  onSave,
  onCancel,
  autoFocus = false,
}: MaxWeightEditFormProps) {
  const isValid = weight && parseFloat(weight) > 0;

  return (
    <div className={styles.editForm}>
      <input
        type="number"
        value={weight}
        onChange={(e) => onWeightChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && isValid) {
            onSave();
          }
        }}
        placeholder="Weight"
        className={styles.weightInput}
        min="0"
        step="0.5"
        autoFocus={autoFocus}
      />
      <select
        value={unit}
        onChange={(e) => onUnitChange(e.target.value as WeightUnit)}
        className={styles.unitSelect}
      >
        <option value="lbs">lbs</option>
        <option value="kg">kg</option>
      </select>
      <button
        onClick={onSave}
        className={styles.saveButton}
        disabled={!isValid}
      >
        Save
      </button>
      <button onClick={onCancel} className={styles.cancelButton}>
        Cancel
      </button>
    </div>
  );
}