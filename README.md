# 🏎️ VelocityX – Real-Time Multiplayer Racing Game

**VelocityX** is a real-time multiplayer racing game built using React, Phaser, Node.js, Express, and Socket.IO. Players can create private rooms, invite friends, select racing tracks, and compete against each other in synchronized multiplayer races.

## 🚀 Features

- **Real-Time Multiplayer:** Play with multiple players using Socket.IO.
- **Room Management:** Create and join racing rooms using room codes.
- **Multiple Racing Tracks:** Four unique maps — Grand Prix, Triangle, Figure Eight, and Snake.
- **Real-Time Physics:** Server-authoritative movement, acceleration, braking, and steering.
- **Collision Detection:** Track boundary and car-to-car collision handling.
- **Lap Tracking:** Server-side lap counting and race completion.
- **Race Countdown:** Synchronized 3-2-1-GO countdown.
- **Winner Detection:** Automatically identifies the first player to complete three laps.
- **Rematch System:** Host can initiate another race.
- **Custom Car Graphics:** Detailed top-down sports car designs.
- **Minimap:** Track overview and navigation assistance.

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

VelocityX uses a client-server architecture.

1. Players connect to the backend using Socket.IO.
2. The server manages rooms, players, and race states.
3. Player inputs are processed by the server.
4. Server-side physics updates player positions and rotations.
5. Updated race states are broadcast to connected players.
6. Phaser renders the synchronized game state in each browser.

The server-authoritative architecture helps maintain consistent gameplay across multiplayer clients.

## 📁 Project Structure

```text
VelocityX/
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
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd VelocityX
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

The backend runs on port `5000`.

### 4. Install frontend dependencies

Open another terminal:

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

## 🎮 Controls

| Key | Action |
|---|---|
| W / ↑ | Accelerate |
| S / ↓ | Brake / Reverse |
| A / ← | Steer Left |
| D / → | Steer Right |

## 🏁 Game Modes and Maps

- Grand Prix
- Triangle Circuit
- Figure Eight
- Snake Circuit

Players compete to complete three laps before their opponents.

## 🔮 Future Improvements

Potential future enhancements include:
- Additional racing circuits.
- More car models and customization.
- Advanced racing effects.
- Persistent player statistics and leaderboards.

## 👨‍💻 Developed With

Built as a full-stack multiplayer game development project, combining frontend development, real-time networking, game physics, and interactive 2D rendering.
