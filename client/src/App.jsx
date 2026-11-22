import Game from "./components/Game";
import { useEffect, useRef, useState } from "react";

import { socket } from "./services/socket";
import Lobby from "./components/Lobby";

function App() {
    const [room, setRoom] = useState(null);
    const [error, setError] = useState("");
    const [connected, setConnected] = useState(socket.connected);

    const [raceStarted, setRaceStarted] = useState(false);
    const [raceFinished, setRaceFinished] = useState(false);

    const [winner, setWinner] = useState(null);
    const [countdown, setCountdown] = useState(null);

    const [gameSession, setGameSession] = useState(0);

    const countdownTimeout = useRef(null);

    useEffect(() => {
        function handleConnect() {
            setConnected(true);
        }

        function handleDisconnect() {
            setConnected(false);

            setRoom(null);
            setRaceStarted(false);
            setRaceFinished(false);

            setWinner(null);
            setCountdown(null);

            clearTimeout(countdownTimeout.current);
        }

        function handleRoomCreated(data) {
            setRoom({
                ...data,
                myId: socket.id
            });

            setError("");
            setRaceFinished(false);
            setWinner(null);
        }

        function handleRoomJoined(data) {
            setRoom({
                ...data,
                myId: socket.id
            });

            setError("");
            setRaceFinished(false);
            setWinner(null);
        }

        function handleRoomUpdated(data) {
            setRoom(previous => ({
                ...data,
                myId: previous?.myId || socket.id
            }));
        }

        function handleCountdown(count) {
            setCountdown(count);
        }

        function handleCountdownCancelled() {
            setCountdown(null);
            setRaceStarted(false);

            clearTimeout(countdownTimeout.current);
        }

        function handleRematchStarting() {
            setRaceFinished(false);
            setWinner(null);
            setCountdown(3);
        }

        function handleRaceStarted(data) {
            setRoom(previous => ({
                ...previous,
                ...data,
                myId: socket.id
            }));

            setRaceStarted(true);
            setRaceFinished(false);
            setWinner(null);

            // Create a fresh Phaser scene.
            setGameSession(previous => previous + 1);

            setCountdown("GO!");

            clearTimeout(countdownTimeout.current);

            countdownTimeout.current = setTimeout(() => {
                setCountdown(null);
            }, 800);
        }

        function handleRaceFinished(data) {
            console.log("Race finished!", data);

            setWinner(data.winner);
            setRaceFinished(true);
            setRaceStarted(true);

            setCountdown(null);

            clearTimeout(countdownTimeout.current);
        }

        function handleRoomError(message) {
            setError(message);
        }

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        socket.on("room-created", handleRoomCreated);
        socket.on("room-joined", handleRoomJoined);
        socket.on("room-updated", handleRoomUpdated);

        socket.on("countdown-tick", handleCountdown);
        socket.on("countdown-cancelled", handleCountdownCancelled);

        socket.on("rematch-starting", handleRematchStarting);

        socket.on("race-started", handleRaceStarted);
        socket.on("race-finished", handleRaceFinished);

        socket.on("room-error", handleRoomError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);

            socket.off("room-created", handleRoomCreated);
            socket.off("room-joined", handleRoomJoined);
            socket.off("room-updated", handleRoomUpdated);

            socket.off("countdown-tick", handleCountdown);
            socket.off("countdown-cancelled", handleCountdownCancelled);

            socket.off("rematch-starting", handleRematchStarting);

            socket.off("race-started", handleRaceStarted);
            socket.off("race-finished", handleRaceFinished);

            socket.off("room-error", handleRoomError);

            clearTimeout(countdownTimeout.current);
        };
    }, []);

    function createRoom(username) {
        setError("");
        socket.emit("create-room", { username });
    }

    function joinRoom(username, roomCode) {
        setError("");

        socket.emit("join-room", {
            username,
            roomCode
        });
    }

    function selectMap(mapId) {
        setError("");

        socket.emit("select-map", {
            mapId
        });
    }

    function startRace() {
        setError("");
        socket.emit("start-race");
    }

    function leaveRoom() {
        socket.emit("leave-room");

        setRoom(null);

        setRaceStarted(false);
        setRaceFinished(false);

        setWinner(null);
        setCountdown(null);

        setError("");

        clearTimeout(countdownTimeout.current);
    }

    const isHost = room && room.host === room.myId;

    return (
        <div
            style={{
                background: "linear-gradient(135deg, #172554 0%, #1e3a5f 50%, #164e63 100%)",
                minHeight: "100vh",
                color: "white",
                padding: "30px",
                textAlign: "center",
                position: "relative",
                boxSizing: "border-box"
            }}
        >
            <h1>🏎️ Multiplayer Racing Arena</h1>

            <p>
                Server Status:{" "}
                {connected ? "🟢 Connected" : "🔴 Disconnected"}
            </p>

            {error && (
                <p style={{ color: "#ff5555" }}>
                    {error}
                </p>
            )}

            {!raceStarted ? (
                <Lobby
                    room={room}
                    onCreateRoom={createRoom}
                    onJoinRoom={joinRoom}
                    onSelectMap={selectMap}
                    onStartRace={startRace}
                    onLeaveRoom={leaveRoom}
                    raceStarted={raceStarted}
                />
            ) : (
                <>
                    <h2>
                        {raceFinished
                            ? "🏁 Race Completed!"
                            : "🏁 Race is LIVE!"}
                    </h2>

                    <Game
                        key={gameSession}
                        room={room}
                    />

                    {!raceFinished && (
                        <button
                            onClick={leaveRoom}
                            style={{
                                marginTop: "20px",
                                padding: "12px 25px",
                                background: "#dc2626",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer"
                            }}
                        >
                            Leave Race
                        </button>
                    )}
                </>
            )}

            {/* Countdown overlay */}
            {countdown !== null && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "rgba(0,0,0,0.55)",
                        pointerEvents: "none",
                        zIndex: 3000
                    }}
                >
                    <h1
                        style={{
                            fontSize: countdown === "GO!" ? "100px" : "140px",
                            color: countdown === "GO!" ? "#22ff66" : "#ffffff",
                            fontWeight: "bold",
                            textShadow: "4px 4px 12px black"
                        }}
                    >
                        {countdown}
                    </h1>
                </div>
            )}

            {/* Winner announcement */}
            {raceFinished && winner && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "rgba(0,0,0,0.85)",
                        zIndex: 2000
                    }}
                >
                    <div
                        style={{
                            background: "#202020",
                            padding: "45px",
                            borderRadius: "20px",
                            border: "2px solid #facc15",
                            boxShadow: "0 0 35px rgba(250,204,21,0.3)",
                            width: "90%",
                            maxWidth: "450px"
                        }}
                    >
                        <h1
                            style={{
                                fontSize: "65px",
                                margin: "0 0 15px"
                            }}
                        >
                            🏆
                        </h1>

                        <h1
                            style={{
                                color: "#facc15",
                                fontSize: "32px",
                                marginBottom: "15px"
                            }}
                        >
                            RACE FINISHED!
                        </h1>

                        <h2
                            style={{
                                color: "#ffffff",
                                fontSize: "27px"
                            }}
                        >
                            {winner.username}
                        </h2>

                        <p
                            style={{
                                color: "#22ff66",
                                fontSize: "20px",
                                fontWeight: "bold"
                            }}
                        >
                            IS THE WINNER!
                        </p>

                        <p
                            style={{
                                color: "#bbbbbb",
                                marginTop: "15px"
                            }}
                        >
                            Completed {winner.lap} laps successfully.
                        </p>

                        {isHost ? (
                            <button
                                onClick={startRace}
                                style={{
                                    marginTop: "25px",
                                    padding: "14px 30px",
                                    background: "#22c55e",
                                    color: "#ffffff",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    marginRight: "10px"
                                }}
                            >
                                🔄 Play Again
                            </button>
                        ) : (
                            <p
                                style={{
                                    color: "#facc15",
                                    marginTop: "25px"
                                }}
                            >
                                Waiting for the host to start another race...
                            </p>
                        )}

                        <button
                            onClick={leaveRoom}
                            style={{
                                marginTop: "25px",
                                padding: "14px 30px",
                                background: "#dc2626",
                                color: "#ffffff",
                                fontWeight: "bold",
                                fontSize: "16px",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer"
                            }}
                        >
                            Leave Room
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;