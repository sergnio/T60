import { WorkoutCardScalable } from "./stories/WorkoutCardScalable";
import type { Exercise } from "./stories/WorkoutCardScalable";
import { WorkoutCardT18 } from "./stories/WorkoutCardT18";

// Sample workout data
const benchPress: Exercise = {
  name: "Bench Press",
  weightUnit: "lbs",
  sets: [
    { weight: 170, completed: true },
    { weight: 190, completed: true },
    { weight: 210, completed: false },
    { weight: 230, completed: false },
    { weight: 250, completed: false },
  ],
  currentSetIndex: 2,
};

const deadlift: Exercise = {
  name: "Deadlift",
  weightUnit: "lbs",
  sets: [
    { weight: 265, completed: true },
    { weight: 285, completed: false },
    { weight: 305, completed: false },
    { weight: 325, completed: false },
  ],
  currentSetIndex: 1,
};

const squat: Exercise = {
  name: "Back Squat",
  weightUnit: "lbs",
  sets: [
    { weight: 185, completed: true },
    { weight: 225, completed: true },
    { weight: 275, completed: true },
    { weight: 315, completed: false },
    { weight: 365, completed: false },
  ],
  currentSetIndex: 3,
};

const App = () => (
  <div className="flex flex-col gap-10 w-screen h-screen bg-gray-50 dark:bg-gray-900 p-10 items-center justify-center">
    <h1 className="text-7xl font-bold text-gray-900 dark:text-white">
      Workout Dashboard
    </h1>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full max-w-[90vw]">
      <WorkoutCardScalable
        personName="TONY"
        exercise={benchPress}
        variant="active"
        onSetComplete={(index) => console.log(`Set ${index} completed`)}
      />
      <WorkoutCardScalable
        personName="STEVE"
        exercise={deadlift}
        variant="active"
        onSetComplete={(index) => console.log(`Set ${index} completed`)}
      />
      <WorkoutCardT18
        personName="ALEX"
        exercise={squat}
        isActive={true}
        onSetComplete={(index) => console.log(`Set ${index} completed`)}
      />
    </div>
  </div>
);

export default App;
