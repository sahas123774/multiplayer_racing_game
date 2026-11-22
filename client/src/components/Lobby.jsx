import { useState } from "react";
import { MAP_OPTIONS } from "../game/track";

const previews = {
    "grand-prix": "M 18 68 L 175 68 L 195 58 L 195 43 L 175 32 L 145 32 L 145 12 L 35 12 L 18 25 Z",
    triangle: "M 110 10 L 205 75 L 15 75 Z",
    "figure-eight": "M 110 10 C 195 10 215 70 110 80 C 5 70 25 10 110 10",
    snake: "M 12 70 L 55 70 L 75 50 L 48 35 L 75 15 L 115 15 L 145 45 L 175 65 L 205 40 L 195 12"
};

function Lobby({
    room,
    onCreateRoom,
    onJoinRoom,
    onStartRace,
    onLeaveRoom,
    onSelectMap,
    raceStarted
}) {
    const [username, setUsername] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [joinMode, setJoinMode] = useState(false);

    const isHost = room && room.host === room.myId;

    const selectedMap = room?.selectedMap || "grand-prix";

    const mapLocked =
        raceStarted ||
        room?.gameStarted ||
        room?.countdownStarted;

    function handleCreate() {
        if (!username.trim()) return;
        onCreateRoom(username.trim());
    }

    function handleJoin() {
        if (!username.trim() || !roomCode.trim()) return;
        onJoinRoom(username.trim(), roomCode.trim());
    }

    function copyRoomCode() {
        if (room?.roomCode) {
            navigator.clipboard.writeText(room.roomCode);
        }
    }

    const styles = {
        container: {
            width: "100%",
            maxWidth: "1000px",
            margin: "30px auto",
            color: "#ffffff"
        },

        card: {
            background: "linear-gradient(145deg, #243b55, #182d46)",
            border: "1px solid #3b5878",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 12px 35px rgba(0,0,0,0.22)"
        },

        input: {
            width: "100%",
            boxSizing: "border-box",
            padding: "13px",
            marginTop: "10px",
            borderRadius: "9px",
            border: "1px solid #526b87",
            background: "#10243c",
            color: "white",
            fontSize: "15px",
            outline: "none"
        },

        primaryButton: {
            padding: "13px 22px",
            border: "none",
            borderRadius: "9px",
            background: "#ff5938",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px"
        },

        secondaryButton: {
            padding: "12px 20px",
            border: "1px solid #00b8d9",
            borderRadius: "9px",
            background: "#123d58",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px"
        }
    };

    // Create/join screen.
    if (!room) {
        return (
            <div style={styles.container}>
                <div style={{
                    ...styles.card,
                    maxWidth: "520px",
                    margin: "auto"
                }}>
                    <h2 style={{ marginTop: 0 }}>
                        🏁 Enter the Racing Arena
                    </h2>

                    <p style={{ color: "#cbd5e1" }}>
                        Create a race room or join your friends.
                    </p>

                    <input
                        style={styles.input}
                        placeholder="Enter your username"
                        value={username}
                        maxLength={20}
                        onChange={event => setUsername(event.target.value)}
                    />

                    {!joinMode ? (
                        <>
                            <button
                                style={{
                                    ...styles.primaryButton,
                                    width: "100%",
                                    marginTop: "20px"
                                }}
                                onClick={handleCreate}
                            >
                                🏎️ Create Race Room
                            </button>

                            <button
                                style={{
                                    ...styles.secondaryButton,
                                    width: "100%",
                                    marginTop: "12px"
                                }}
                                onClick={() => setJoinMode(true)}
                            >
                                Join Existing Room
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                style={styles.input}
                                placeholder="Enter room code"
                                value={roomCode}
                                maxLength={6}
                                onChange={event =>
                                    setRoomCode(event.target.value.toUpperCase())
                                }
                            />

                            <button
                                style={{
                                    ...styles.primaryButton,
                                    width: "100%",
                                    marginTop: "15px"
                                }}
                                onClick={handleJoin}
                            >
                                Join Race
                            </button>

                            <button
                                style={{
                                    ...styles.secondaryButton,
                                    width: "100%",
                                    marginTop: "12px"
                                }}
                                onClick={() => setJoinMode(false)}
                            >
                                Back
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Room lobby.
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ marginTop: 0 }}>
                    🏁 Race Lobby
                </h2>

                <div style={{
                    background: "#10243c",
                    padding: "17px",
                    borderRadius: "12px",
                    marginBottom: "25px"
                }}>
                    <p style={{
                        color: "#94a3b8",
                        margin: "0 0 7px"
                    }}>
                        ROOM CODE
                    </p>

                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap"
                    }}>
                        <h1 style={{
                            color: "#00d9ff",
                            letterSpacing: "6px",
                            margin: 0
                        }}>
                            {room.roomCode}
                        </h1>

                        <button
                            style={styles.secondaryButton}
                            onClick={copyRoomCode}
                        >
                            Copy Code
                        </button>
                    </div>
                </div>

                {/* Map selection */}
                <div style={{ marginBottom: "28px" }}>
                    <h3 style={{
                        textAlign: "left",
                        marginBottom: "6px"
                    }}>
                        🗺️ Choose Your Circuit
                    </h3>

                    <p style={{
                        color: "#cbd5e1",
                        textAlign: "left",
                        marginTop: 0,
                        fontSize: "14px"
                    }}>
                        {mapLocked
                            ? "The selected circuit is locked for this race."
                            : isHost
                                ? "Choose the circuit for everyone in the room."
                                : "The host controls the circuit selection."}
                    </p>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                        gap: "14px"
                    }}>
                        {MAP_OPTIONS.map(map => {
                            const selected = selectedMap === map.id;

                            return (
                                <button
                                    key={map.id}
                                    disabled={!isHost || mapLocked}
                                    onClick={() => onSelectMap(map.id)}
                                    style={{
                                        textAlign: "left",
                                        padding: "14px",
                                        borderRadius: "13px",
                                        border: selected
                                            ? "2px solid #ff5938"
                                            : "1px solid #526b87",
                                        background: selected
                                            ? "linear-gradient(145deg, #49352f, #26364a)"
                                            : "#10243c",
                                        color: "white",
                                        cursor: !isHost || mapLocked
                                            ? "default"
                                            : "pointer",
                                        opacity: !isHost && !selected
                                            ? 0.8
                                            : 1
                                    }}
                                >
                                    <svg
                                        viewBox="0 0 220 90"
                                        width="100%"
                                        height="90"
                                    >
                                        <path
                                            d={previews[map.id]}
                                            fill="none"
                                            stroke="#64748b"
                                            strokeWidth="17"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        <path
                                            d={previews[map.id]}
                                            fill="none"
                                            stroke="#e2e8f0"
                                            strokeWidth="2"
                                            strokeDasharray="7 6"
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "5px"
                                    }}>
                                        <strong>{map.name}</strong>

                                        {selected && (
                                            <span style={{
                                                color: "#ff805f",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}>
                                                SELECTED
                                            </span>
                                        )}
                                    </div>

                                    <p style={{
                                        fontSize: "12px",
                                        color: "#cbd5e1",
                                        margin: "7px 0"
                                    }}>
                                        {map.description}
                                    </p>

                                    <span style={{
                                        fontSize: "11px",
                                        color: "#38bdf8"
                                    }}>
                                        Difficulty: {map.difficulty}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Players */}
                <div style={{
                    textAlign: "left",
                    background: "#10243c",
                    padding: "18px",
                    borderRadius: "12px"
                }}>
                    <h3 style={{ marginTop: 0 }}>
                        👥 Drivers ({room.players.length}/10)
                    </h3>

                    {room.players.map(player => (
                        <div
                            key={player.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "11px",
                                marginTop: "8px",
                                borderRadius: "8px",
                                background: "#1e3652"
                            }}
                        >
                            <span>
                                🏎️ {player.username}
                            </span>

                            {player.id === room.host && (
                                <span style={{
                                    color: "#facc15",
                                    fontWeight: "bold",
                                    fontSize: "12px"
                                }}>
                                    HOST
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Room controls */}
                <div style={{
                    marginTop: "25px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    flexWrap: "wrap"
                }}>
                    {isHost && !mapLocked && (
                        <button
                            style={styles.primaryButton}
                            onClick={onStartRace}
                            disabled={room.players.length < 2}
                        >
                            🚦 Start Race
                        </button>
                    )}

                    {!isHost && (
                        <p style={{ color: "#facc15" }}>
                            Waiting for the host to start the race...
                        </p>
                    )}

                    {room.countdownStarted && (
                        <p style={{ color: "#22c55e" }}>
                            Race starting...
                        </p>
                    )}

                    <button
                        style={{
                            ...styles.secondaryButton,
                            borderColor: "#ef4444",
                            background: "#7f1d1d"
                        }}
                        onClick={onLeaveRoom}
                    >
                        Leave Room
                    </button>
                </div>

                {room.players.length < 2 && isHost && (
                    <p style={{
                        color: "#facc15",
                        fontSize: "13px",
                        marginTop: "15px"
                    }}>
                        At least 2 players are required to start.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Lobby;