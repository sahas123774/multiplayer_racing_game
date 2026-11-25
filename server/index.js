const express = require("express");
const http = require("http");
const cors = require("cors");

const { Server } = require("socket.io");

const {
    TRACKS,
    initializeRace,
    updatePlayer,
    resolveCarCollisions
} = require("./gameLogic");

const {
    rooms,
    createRoom,
    joinRoom,
    removePlayer
} = require("./rooms");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "http://localhost:5173",
    "https://multiplayer-racing-game-kappa.vercel.app",
    "https://multiplayer-racing-game-p316o30jr-sahas123774s-projects.vercel.app",
    "https://client-lac-mu-13.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"]
}));

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

const TICK_RATE = 30;
const TOTAL_LAPS = 3;

function getRoomData(room) {
    return {
        roomCode: room.roomCode,
        host: room.host,

        players: room.players.map(player => ({
            id: player.id,
            username: player.username,
            x: player.x,
            y: player.y,
            angle: player.angle,
            speed: player.speed,
            lap: player.lap || 0
        })),

        selectedMap: room.selectedMap || "grand-prix",

        gameStarted: room.gameStarted,
        countdownStarted: room.countdownStarted,
        gameFinished: room.gameFinished,
        winner: room.winner
    };
}

function broadcastRoom(room) {
    io.to(room.roomCode).emit(
        "room-updated",
        getRoomData(room)
    );
}

function broadcastRaceState(room) {
    io.to(room.roomCode).emit("race-state", {
        players: room.players.map(player => ({
            id: player.id,
            username: player.username,
            x: player.x,
            y: player.y,
            angle: player.angle,
            speed: player.speed,
            lap: player.lap || 0
        }))
    });
}

function cancelCountdown(room) {
    if (room.countdownTimer) {
        clearInterval(room.countdownTimer);
        room.countdownTimer = null;
    }

    room.countdownStarted = false;

    io.to(room.roomCode).emit("countdown-cancelled");
    broadcastRoom(room);
}

io.on("connection", socket => {
    console.log("Connected:", socket.id);

    // Receive player controls.
    socket.on("player-input", input => {
        const roomCode = socket.data.roomCode;
        const room = rooms.get(roomCode);

        if (!room || !room.gameStarted || room.gameFinished) {
            return;
        }

        const player = room.players.find(
            item => item.id === socket.id
        );

        if (!player) return;

        player.input = {
            up: Boolean(input.up),
            down: Boolean(input.down),
            left: Boolean(input.left),
            right: Boolean(input.right)
        };
    });

    // Create room.
    socket.on("create-room", data => {
        const username = String(data?.username || "").trim();

        if (!username || username.length > 20) {
            socket.emit(
                "room-error",
                "Username must be between 1 and 20 characters."
            );
            return;
        }

        const room = createRoom(socket.id, username);

        socket.join(room.roomCode);
        socket.data.roomCode = room.roomCode;

        socket.emit("room-created", getRoomData(room));

        broadcastRoom(room);
    });

    // Join room.
    socket.on("join-room", data => {
        const username = String(data?.username || "").trim();
        const roomCode = String(data?.roomCode || "")
            .trim()
            .toUpperCase();

        if (!username || username.length > 20) {
            socket.emit(
                "room-error",
                "Username must be between 1 and 20 characters."
            );
            return;
        }

        const result = joinRoom(
            roomCode,
            socket.id,
            username
        );

        if (result.error) {
            socket.emit("room-error", result.error);
            return;
        }

        const room = result.room;

        socket.join(room.roomCode);
        socket.data.roomCode = room.roomCode;

        socket.emit("room-joined", getRoomData(room));

        broadcastRoom(room);
    });

    // Host selects the circuit.
    socket.on("select-map", data => {
        const roomCode = socket.data.roomCode;
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit("room-error", "Room not found.");
            return;
        }

        if (room.host !== socket.id) {
            socket.emit(
                "room-error",
                "Only the host can select the map."
            );
            return;
        }

        if (room.gameStarted || room.countdownStarted) {
            socket.emit(
                "room-error",
                "Map selection is locked once the race starts."
            );
            return;
        }

        const mapId = data?.mapId;

        if (!mapId || !TRACKS[mapId]) {
            socket.emit(
                "room-error",
                "Invalid map selection."
            );
            return;
        }

        room.selectedMap = mapId;

        broadcastRoom(room);
    });

    // Start race or rematch.
    socket.on("start-race", () => {
        const roomCode = socket.data.roomCode;
        const room = rooms.get(roomCode);

        if (!room) return;

        if (room.host !== socket.id) {
            socket.emit(
                "room-error",
                "Only the host can start the race."
            );
            return;
        }

        if (room.players.length < 2) {
            socket.emit(
                "room-error",
                "At least 2 players are required."
            );
            return;
        }

        if (room.gameStarted || room.countdownStarted) {
            return;
        }

        const isRematch = room.gameFinished;

        room.gameFinished = false;
        room.winner = null;

        room.countdownStarted = true;

        initializeRace(room);

        room.activeCollisions = new Set();

        if (isRematch) {
            io.to(room.roomCode).emit("rematch-starting");
        }

        broadcastRoom(room);

        let count = 3;

        io.to(room.roomCode).emit("countdown-tick", count);

        room.countdownTimer = setInterval(() => {
            if (room.players.length < 2) {
                cancelCountdown(room);
                return;
            }

            count--;

            if (count > 0) {
                io.to(room.roomCode).emit(
                    "countdown-tick",
                    count
                );
                return;
            }

            clearInterval(room.countdownTimer);
            room.countdownTimer = null;

            room.countdownStarted = false;
            room.gameStarted = true;

            io.to(room.roomCode).emit(
                "race-started",
                getRoomData(room)
            );

            broadcastRoom(room);
        }, 1000);
    });

    // Leave room.
    socket.on("leave-room", () => {
        const roomCode = socket.data.roomCode;

        if (!roomCode) return;

        const room = rooms.get(roomCode);

        socket.leave(roomCode);
        socket.data.roomCode = null;

        if (!room) return;

        const updatedRoom = removePlayer(roomCode, socket.id);

        if (updatedRoom) {
            if (
                updatedRoom.countdownStarted &&
                updatedRoom.players.length < 2
            ) {
                cancelCountdown(updatedRoom);
            }

            broadcastRoom(updatedRoom);
        }
    });

    // Disconnect cleanup.
    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);

        const roomCode = socket.data.roomCode;

        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        const updatedRoom = removePlayer(roomCode, socket.id);

        if (updatedRoom) {
            if (
                updatedRoom.countdownStarted &&
                updatedRoom.players.length < 2
            ) {
                cancelCountdown(updatedRoom);
            }

            broadcastRoom(updatedRoom);
        }
    });
});

// Server-authoritative physics loop.
setInterval(() => {
    const dt = 1 / TICK_RATE;

    rooms.forEach(room => {
        if (
            !room.gameStarted ||
            room.gameFinished ||
            room.countdownStarted
        ) {
            return;
        }

        room.players.forEach(player => {
            updatePlayer(
                player,
                dt,
                room.selectedMap
            );
        });

        // Detect car-to-car collisions.
const collisions = resolveCarCollisions(
    room.players,
    room.selectedMap
);

// Track collisions so sounds don't repeat every physics tick.
if (!room.activeCollisions) {
    room.activeCollisions = new Set();
}

const currentCollisions = new Set();

collisions.forEach(([playerA, playerB]) => {
    const collisionKey = [playerA, playerB]
        .sort()
        .join("-");

    currentCollisions.add(collisionKey);

    // Emit only when a new collision begins.
    if (!room.activeCollisions.has(collisionKey)) {
        io.to(playerA).emit("car-collision");
        io.to(playerB).emit("car-collision");
    }
});

room.activeCollisions = currentCollisions;

        const winner = room.players.find(
            player => player.lap >= TOTAL_LAPS
        );

        if (winner) {
            room.gameFinished = true;
            room.gameStarted = false;

            room.winner = {
                id: winner.id,
                username: winner.username,
                lap: winner.lap
            };

            room.players.forEach(player => {
                player.speed = 0;

                player.input = {
                    up: false,
                    down: false,
                    left: false,
                    right: false
                };
            });

            broadcastRaceState(room);

            io.to(room.roomCode).emit(
                "race-finished",
                {
                    winner: room.winner
                }
            );

            broadcastRoom(room);

            return;
        }

        broadcastRaceState(room);
    });
}, 1000 / TICK_RATE);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});