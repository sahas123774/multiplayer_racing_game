import { useEffect, useRef } from "react";
import Phaser from "phaser";

import RacingScene from "../game/RacingScene";
import { socket } from "../services/socket";

function Game({ room }) {
    const gameRef = useRef(null);

    useEffect(() => {
        if (!room || !room.roomCode || !gameRef.current) {
            return;
        }

        const config = {
            type: Phaser.AUTO,
            width: 1200,
            height: 800,
            parent: gameRef.current,
            backgroundColor: "#347b40",

            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },

            scene: []
        };

        const game = new Phaser.Game(config);

        game.scene.add(
            "RacingScene",
            RacingScene,
            true,
            {
                socket,
                room
            }
        );

        return () => {
            game.destroy(true);
        };
    }, [room?.roomCode, room?.selectedMap]);

    return (
        <div
            ref={gameRef}
            style={{
                width: "100%",
                maxWidth: "1200px",
                aspectRatio: "3 / 2",
                margin: "20px auto",
                overflow: "hidden",
                borderRadius: "14px",
                border: "2px solid #334155",
                boxShadow: "0 15px 45px rgba(0,0,0,0.35)"
            }}
        />
    );
}

export default Game;