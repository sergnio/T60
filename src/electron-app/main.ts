import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { closeDatabase, initDatabase, seedDatabase } from "../db/init";
import * as queries from "../db/queries";

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

// Register IPC handlers for database operations
const registerDatabaseHandlers = () => {
  // People
  ipcMain.handle("db:createPerson", (_, input) => queries.createPerson(input));
  ipcMain.handle("db:getPerson", (_, id) => queries.getPerson(id));
  ipcMain.handle("db:getAllPeople", () => queries.getAllPeople());
  ipcMain.handle("db:updatePerson", (_, id, input) =>
    queries.updatePerson(id, input),
  );
  ipcMain.handle("db:deletePerson", (_, id) => queries.deletePerson(id));

  // Workout Sessions
  ipcMain.handle("db:createWorkoutSession", (_, input) =>
    queries.createWorkoutSession(input),
  );
  ipcMain.handle("db:getWorkoutSession", (_, id) =>
    queries.getWorkoutSession(id),
  );
  ipcMain.handle("db:getActiveWorkoutSession", () =>
    queries.getActiveWorkoutSession(),
  );
  ipcMain.handle("db:getAllWorkoutSessions", () =>
    queries.getAllWorkoutSessions(),
  );
  ipcMain.handle("db:updateWorkoutSession", (_, id, input) =>
    queries.updateWorkoutSession(id, input),
  );
  ipcMain.handle("db:endWorkoutSession", (_, id) =>
    queries.endWorkoutSession(id),
  );
  ipcMain.handle("db:deleteWorkoutSession", (_, id) =>
    queries.deleteWorkoutSession(id),
  );

  // Session Participants
  ipcMain.handle("db:createSessionParticipant", (_, input) =>
    queries.createSessionParticipant(input),
  );
  ipcMain.handle("db:getSessionParticipant", (_, id) =>
    queries.getSessionParticipant(id),
  );
  ipcMain.handle("db:getSessionParticipants", (_, sessionId) =>
    queries.getSessionParticipants(sessionId),
  );
  ipcMain.handle("db:getActiveSessionParticipants", (_, sessionId) =>
    queries.getActiveSessionParticipants(sessionId),
  );
  ipcMain.handle("db:updateSessionParticipant", (_, id, input) =>
    queries.updateSessionParticipant(id, input),
  );
  ipcMain.handle("db:deleteSessionParticipant", (_, id) =>
    queries.deleteSessionParticipant(id),
  );

  // Sets
  ipcMain.handle("db:createSet", (_, input) => queries.createSet(input));
  ipcMain.handle("db:getSet", (_, id) => queries.getSet(id));
  ipcMain.handle("db:getSetsByParticipant", (_, participantId) =>
    queries.getSetsByParticipant(participantId),
  );
  ipcMain.handle("db:updateSet", (_, id, input) =>
    queries.updateSet(id, input),
  );
  ipcMain.handle("db:completeSet", (_, id) => queries.completeSet(id));
  ipcMain.handle("db:deleteSet", (_, id) => queries.deleteSet(id));

  // Joined Queries
  ipcMain.handle("db:getParticipantWithSets", (_, participantId) =>
    queries.getParticipantWithSets(participantId),
  );
  ipcMain.handle("db:getSessionWithParticipants", (_, sessionId) =>
    queries.getSessionWithParticipants(sessionId),
  );
  ipcMain.handle("db:getActiveSessionWithParticipants", () =>
    queries.getActiveSessionWithParticipants(),
  );

  // Seed database
  ipcMain.handle("db:seedDatabase", () => seedDatabase());
};

app.whenReady().then(() => {
  // Initialize database
  initDatabase();

  // Register IPC handlers
  registerDatabaseHandlers();

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
