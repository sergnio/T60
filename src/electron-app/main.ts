import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { closeDatabase, initDatabase, seedDatabase } from "../db/init.js";
import * as personService from "../services/personService.js";
import * as workoutSessionService from "../services/workoutSessionService.js";
import * as sessionParticipantService from "../services/sessionParticipantService.js";
import * as setService from "../services/setService.js";
import * as workflowService from "../services/workflowService.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
    },
  });

  win.loadFile("dist/index.html");
};

// Register IPC handlers for service layer operations
const registerServiceHandlers = () => {
  // People
  ipcMain.handle("db:createPerson", (_, input) =>
    personService.createPerson(input),
  );
  ipcMain.handle("db:getPerson", (_, id) => personService.getPerson(id));
  ipcMain.handle("db:getAllPeople", () => personService.getAllPeople());
  ipcMain.handle("db:updatePerson", (_, id, input) =>
    personService.updatePerson(id, input),
  );
  ipcMain.handle("db:deletePerson", (_, id) =>
    personService.deletePerson(id),
  );

  // Workout Sessions
  ipcMain.handle("db:createWorkoutSession", (_, input) =>
    workoutSessionService.createWorkoutSession(input),
  );
  ipcMain.handle("db:getWorkoutSession", (_, id) =>
    workoutSessionService.getWorkoutSession(id),
  );
  ipcMain.handle("db:getActiveWorkoutSession", () =>
    workoutSessionService.getActiveWorkoutSession(),
  );
  ipcMain.handle("db:getAllWorkoutSessions", () =>
    workoutSessionService.getAllWorkoutSessions(),
  );
  ipcMain.handle("db:updateWorkoutSession", (_, id, input) =>
    workoutSessionService.updateWorkoutSession(id, input),
  );
  ipcMain.handle("db:endWorkoutSession", (_, id) =>
    workoutSessionService.endWorkoutSession(id),
  );
  ipcMain.handle("db:deleteWorkoutSession", (_, id) =>
    workoutSessionService.deleteWorkoutSession(id),
  );

  // Session Participants
  ipcMain.handle("db:createSessionParticipant", (_, input) =>
    sessionParticipantService.createSessionParticipant(input),
  );
  ipcMain.handle("db:getSessionParticipant", (_, id) =>
    sessionParticipantService.getSessionParticipant(id),
  );
  ipcMain.handle("db:getSessionParticipants", (_, sessionId) =>
    sessionParticipantService.getSessionParticipants(sessionId),
  );
  ipcMain.handle("db:getActiveSessionParticipants", (_, sessionId) =>
    sessionParticipantService.getActiveSessionParticipants(sessionId),
  );
  ipcMain.handle("db:updateSessionParticipant", (_, id, input) =>
    sessionParticipantService.updateSessionParticipant(id, input),
  );
  ipcMain.handle("db:deleteSessionParticipant", (_, id) =>
    sessionParticipantService.deleteSessionParticipant(id),
  );

  // Sets
  ipcMain.handle("db:createSet", (_, input) => setService.createSet(input));
  ipcMain.handle("db:getSet", (_, id) => setService.getSet(id));
  ipcMain.handle("db:getSetsByParticipant", (_, participantId) =>
    setService.getSetsByParticipant(participantId),
  );
  ipcMain.handle("db:updateSet", (_, id, input) =>
    setService.updateSet(id, input),
  );
  ipcMain.handle("db:completeSet", (_, id) => setService.completeSet(id));
  ipcMain.handle("db:deleteSet", (_, id) => setService.deleteSet(id));

  // Workflow (joined queries)
  ipcMain.handle("db:getParticipantWithSets", (_, participantId) =>
    workflowService.getParticipantWithSets(participantId),
  );
  ipcMain.handle("db:getSessionWithParticipants", (_, sessionId) =>
    workflowService.getSessionWithParticipants(sessionId),
  );
  ipcMain.handle("db:getActiveSessionWithParticipants", () =>
    workflowService.getActiveSessionWithParticipants(),
  );

  // Seed database
  ipcMain.handle("db:seedDatabase", () => seedDatabase());
};

app.whenReady().then(() => {
  // Initialize database
  initDatabase();

  // Register IPC handlers
  registerServiceHandlers();

  createWindow();

  // needed if we are not quitting the app on all window close.
  // app.on('activate', () => {
  //     if (BrowserWindow.getAllWindows().length === 0) {
  //         createWindow()
  //     }
  // })
});

app.on("window-all-closed", () => {
  closeDatabase();
  app.quit();
});
