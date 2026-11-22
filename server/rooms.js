const rooms = new Map();

const MAX_PLAYERS = 10;

function generateRoomCode() {
    let code;

    do {
        code = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
    } while (rooms.has(code));

    return code;
}

function createRoom(socketId, username) {
    const roomCode = generateRoomCode();

    const room = {
        roomCode,
        host: socketId,

        players: [
            {
                id: socketId,
                username
            }
        ],

        selectedMap: "grand-prix",

        gameStarted: false,
        countdownStarted: false,
        countdownTimer: null,

        gameFinished: false,
        winner: null
    };

    rooms.set(roomCode, room);

    return room;
}

function joinRoom(roomCode, socketId, username) {
    const room = rooms.get(roomCode);

    if (!room) {
        return { error: "Room does not exist!" };
    }

    if (room.gameStarted || room.countdownStarted) {
        return { error: "Race has already started!" };
    }

    if (room.players.length >= MAX_PLAYERS) {
        return { error: "Room is full!" };
    }

    room.players.push({
        id: socketId,
        username
    });

    return { room };
}

function removePlayer(roomCode, socketId) {
    const room = rooms.get(roomCode);

    if (!room) return null;

    room.players = room.players.filter(
        player => player.id !== socketId
    );

    if (room.players.length === 0) {
        if (room.countdownTimer) {
            clearInterval(room.countdownTimer);
        }

        rooms.delete(roomCode);
        return null;
    }

    if (room.host === socketId) {
        room.host = room.players[0].id;
    }

    return room;
}

module.exports = {
    rooms,
    createRoom,
    joinRoom,
    removePlayer
};