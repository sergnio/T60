import type { Exercise } from "./stories/WorkoutCardT18";
import { WorkoutCardT18 } from "./stories/WorkoutCardT18";

// Sample workout data
const tonyBench: Exercise = {
  name: "Bench Press",
  weightUnit: "lbs",
  sets: [
    { weight: 170, completed: true },
    { weight: 250, completed: true },
    { weight: 210, completed: false },
    { weight: 230, completed: false },
    { weight: 250, completed: false },
  ],
  currentSetIndex: 1,
};
// Sample workout data
const sergioBench: Exercise = {
  name: "Bench Press",
  weightUnit: "lbs",
  sets: [
    { weight: 170, completed: true },
    { weight: 95, completed: true },
    { weight: 210, completed: false },
    { weight: 230, completed: false },
    { weight: 250, completed: false },
  ],
  currentSetIndex: 1,
};

const steveDeadlift: Exercise = {
  name: "Deadlift",
  weightUnit: "lbs",
  sets: [
    { weight: 265, completed: true },
    { weight: 155, completed: true },
    { weight: 305, completed: false },
    { weight: 305, completed: false },
    { weight: 325, completed: false },
  ],
  currentSetIndex: 1,
};

const noahDeadlift: Exercise = {
  name: "Deadlift",
  weightUnit: "lbs",
  sets: [
    { weight: 265, completed: true },
    { weight: 210, completed: true },
    { weight: 305, completed: false },
    { weight: 325, completed: false },
    { weight: 325, completed: false },
  ],
  currentSetIndex: 1,
};

const maviSquat: Exercise = {
  name: "Back Squat",
  weightUnit: "lbs",
  sets: [
    { weight: 185, completed: true },
    { weight: 245, completed: true },
    { weight: 315, completed: false },
    { weight: 365, completed: false },
    { weight: 365, completed: false },
  ],
  currentSetIndex: 1,
};

const kakesSquat: Exercise = {
  name: "Back Squat",
  weightUnit: "lbs",
  sets: [
    { weight: 185, completed: true },
    { weight: 300, completed: true },
    { weight: 315, completed: false },
    { weight: 365, completed: false },
    { weight: 365, completed: false },
  ],
  currentSetIndex: 1,
};

const App = () => (
  <div className="flex flex-col gap-10 w-screen h-screen bg-gray-50 dark:bg-gray-900 p-10 items-center justify-center">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full max-w-[90vw]">
      {/* Active Users - Top 3 */}
      <div className="flex flex-col gap-3">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center">
          {tonyBench.name}
        </div>
        <WorkoutCardT18
          personName="TONY"
          exercise={tonyBench}
          isActive
          onSetComplete={(index) => console.log(`Set ${index} completed`)}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center">
          {steveDeadlift.name}
        </div>
        <WorkoutCardT18
          personName="STEVE"
          exercise={steveDeadlift}
          isActive
          onSetComplete={(index) => console.log(`Set ${index} completed`)}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center">
          {maviSquat.name}
        </div>
        <WorkoutCardT18
          personName="VICTORIA"
          exercise={maviSquat}
          isActive
          onSetComplete={(index) => console.log(`Set ${index} completed`)}
        />
      </div>

      {/* Resting Users - Bottom 3 */}
      <WorkoutCardT18
        personName="SERGIO"
        exercise={sergioBench}
        isActive={false}
        onSetComplete={(index) => console.log(`Set ${index} completed`)}
      />
      <WorkoutCardT18
        personName="NOAH"
        exercise={noahDeadlift}
        isActive={false}
        onSetComplete={(index) => console.log(`Set ${index} completed`)}
      />
      <WorkoutCardT18
        personName="KAKES"
        exercise={kakesSquat}
        isActive={false}
        onSetComplete={(index) => console.log(`Set ${index} completed`)}
      />
    </div>
  </div>
);

export default App;
