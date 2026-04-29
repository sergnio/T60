# Tony's Guide to This Project

You don't need to know how to code! You just need to know how to talk to the AI and how to run a few commands. 

## Setup - important! Only needed once

1. Install [Node.js](https://nodejs.org) (the LTS version).
2. Open the Terminal, drag this folder into it, and hit enter.
3. Run:
   ```
   npm install
   ```
   This downloads everything the project needs. Takes a few minutes. If it errors out, paste the error to the AI.

## Terms you need to know
- **Terminal**: the black box where you type commands. You can open it on Mac with Spotlight (CMD + Space) and typing "Terminal".
- **Database**: "DB" for short. It's where the app stores its data. It's what keeps track of your workouts, your timer settings, and all that stuff.
- **npm**: the tool that manages the project's scripts. You use it to run commands like `npm install` and `npm run start`.
- **Github**: the website where the code lives. You don't need to interact with it directly, but it's good to know that it's there.
- **Git**: the tool that manages "save points" (commits) in the code. You don't need to use it directly, but it's what allows you to save and rewind your code changes.

## The commands you'll actually use

| Command         | What it does                                     | When to run it                     |
|-----------------|--------------------------------------------------|------------------------------------|
| `npm run start` | Builds and launches the real desktop app         | When you want to test the full app |
| `CTRL + C`      | Kills your program, so you can start it up again | When you want to restart the app   |


## If something breaks weirdly...
Paste the error into the AI!

## Save points (a.k.a. "Git/Github")

Think of it like saving your game before a boss fight. The app is the game. The code is your progress. A "save point" (the real word is "commit") is a snapshot you can rewind to if everything breaks. That's the whole idea.


1. **If it works, save it.** Got the button looking right? Save. Login page loads? Save. Don't pile three more AI changes on top of unsaved progress — you'll be one bad prompt away from a disaster.
2. **Before you ask the AI to change something big, save first.** This is the defensive save. If the AI rewrites half the app and it breaks, you want a save point to rewind to.
3. **If everything is broken and you're panicking, don't keep trying to fix it. Rewind.** The moment you're in "I don't understand what happened" territory, every extra change makes it worse. Rewinding to a save point is not failure, it's the whole point of having save points.

How to actually do it: just tell the AI.

- **To save:** "save this" or "commit this with a message about X"
- **To rewind:** "revert to the last save point" or "undo all my changes since the last commit"
- **To see your save points:** "show me my recent commits"

Don't try to do this stuff manually in the Terminal. Let the AI run the commands.

## Some nice rules

2. **Test the change yourself in the browser before saying "done".** Run `npm run start` and click around. The AI can't see the screen.
3. **One change at a time.** Don't ask for 5 features in one go. You won't be able to tell which one broke.
4. **Commit when something works.** Tell the AI "commit this" after every working change. That way you can always go back.
5. **If the AI is going in circles, stop and start a new conversation.** Paste in what's broken and start fresh.


## When you're stuck

- **App won't start:** check the README.md "Troubleshooting" section, or ask AI.
- **A change broke something:** in Terminal run `git status` to see what changed, then ask the AI "revert my last change."

## The single most important thing

**You are the tester.** The AI writes the code. You run it, click the buttons, and tell the AI what's broken or weird. That loop — describe → AI codes → you test → you report back — is the whole job. Trust your eyes, not the AI's claims that something works.
