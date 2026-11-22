# 🏎️ VelocityX – Real-Time Multiplayer Racing Game

**VelocityX** is a real-time multiplayer racing game built using React, Phaser 3, Node.js, Express.js, and Socket.IO. Players can create private rooms, invite friends, select racing tracks, and compete against each other in synchronized multiplayer races.

## 🚀 Features

- **Real-Time Multiplayer:** Play with multiple players using Socket.IO.
- **Room Management:** Create and join racing rooms using unique room codes.
- **Multiple Racing Tracks:** Four unique maps — Grand Prix, Triangle, Figure Eight, and Snake.
- **Real-Time Physics:** Server-authoritative movement, acceleration, braking, and steering.
- **Collision Detection:** Track boundary and car-to-car collision handling.
- **Lap Tracking:** Server-side lap counting and race completion.
- **Race Countdown:** Synchronized 3-2-1-GO countdown.
- **Winner Detection:** Automatically identifies the first player to complete three laps.
- **Rematch System:** Host can initiate another race.
- **Custom Car Graphics:** Detailed top-down sports car designs.
- **Minimap:** Track overview and navigation assistance.
- **Turn Direction Indicator:** Helps players understand upcoming track directions.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend interface |
| Phaser 3 | 2D game rendering |
| Node.js | Backend runtime |
| Express.js | Backend server |
| Socket.IO | Real-time multiplayer communication |
| JavaScript | Game logic and application development |

## 🏗️ Architecture

VelocityX uses a client-server architecture with server-authoritative game logic.

1. Players connect to the backend using Socket.IO.
2. The server manages rooms, players, and race states.
3. Player inputs are sent to the server.
4. Server-side physics updates player positions, rotations, and movement.
5. Updated race states are broadcast to connected players.
6. Phaser renders the synchronized game state in each browser.

The server-authoritative architecture helps maintain consistent gameplay across multiplayer clients.

## 📁 Project Structure

```text
multiplayer_racing_game/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Game.jsx
│   │   │   └── Lobby.jsx
│   │   ├── game/
│   │   │   ├── Car.js
│   │   │   ├── RacingScene.js
│   │   │   └── track.js
│   │   ├── services/
│   │   │   └── socket.js
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── index.js
│   ├── rooms.js
│   ├── gameLogic.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sahas123774/multiplayer_racing_game.git
cd multiplayer_racing_game
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Start the backend server

```bash
node index.js
```

The backend server runs on port `5000`.

### 4. Install frontend dependencies

Open a new terminal from the project root:

```bash
cd client
npm install
```

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

You can open the game in multiple browser windows to test multiplayer functionality.

## 🎮 Controls

| Key | Action |
|---|---|
| W / ↑ | Accelerate |
| S / ↓ | Brake / Reverse |
| A / ← | Steer Left |
| D / → | Steer Right |

## 🏁 Available Racing Maps

### 1. Grand Prix
A technical racing circuit with multiple turns and straights.

### 2. Triangle Circuit
A triangular racing track designed for challenging cornering.

### 3. Figure Eight
A figure-eight circuit with intersecting racing paths.

### 4. Snake Circuit
A winding circuit with multiple consecutive turns.

Players compete to complete three laps before their opponents.

## 🔄 Multiplayer Gameplay Flow

1. A player creates a racing room.
2. Other players join using the room code.
3. The host selects the racing map.
4. The host starts the race.
5. All players receive a synchronized countdown.
6. Players race against each other for three laps.
7. The server identifies the winner.
8. The host can start a rematch.

## 🔮 Future Improvements

Potential future enhancements include:

- Additional racing circuits.
- More car models and customization.
- Advanced racing effects and animations.
- Persistent player statistics.
- Global leaderboards.
- Improved matchmaking.
- Sound effects and background music.

## 👨‍💻 Developed With

**VelocityX** was developed as a full-stack multiplayer game development project, combining frontend development, real-time networking, game physics, and interactive 2D rendering.

**Repository:** [multiplayer_racing_game](https://github.com/sahas123774/multiplayer_racing_game)

---

⭐ If you like this project, consider giving the repository a star!