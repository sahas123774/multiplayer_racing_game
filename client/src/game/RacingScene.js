
import Phaser from "phaser";

import Car from "./Car";
import { createTrack, getTrack } from "./track";

export default class RacingScene extends Phaser.Scene {
    constructor() {
        super("RacingScene");
    }

    init(data) {
        this.socket = data.socket;
        this.room = data.room;

        this.mapId = this.room.selectedMap || "grand-prix";
        this.track = getTrack(this.mapId);
    }

    // =====================================
    // LOAD AUDIO
    // =====================================

    preload() {
        this.load.audio("engine", "/sounds/engine.mp3");
    }

    create() {
        // Create selected circuit.
        createTrack(this, this.mapId);

        this.cars = new Map();
        this.labels = new Map();
        this.targets = new Map();
        this.playerColors = new Map();

        this.myId = this.socket.id;

        this.colors = [
            0xff3333,
            0x3388ff,
            0xffff33,
            0x33ff88,
            0xff55ff,
            0xff9933,
            0x33ffff,
            0xffffff,
            0x9955ff,
            0xff6688
        ];

        // Create all player cars.
        this.room.players.forEach((player, index) => {
            const playerColor =
                this.colors[index % this.colors.length];

            const car = new Car(
                this,
                player.x,
                player.y,
                playerColor
            );

            car.rotation = player.angle;
            car.setDepth(10);

            const label = this.add.text(
                player.x,
                player.y - 35,
                player.username,
                {
                    fontSize: "13px",
                    color: "#ffffff",
                    backgroundColor: "#222222",
                    padding: { x: 5, y: 3 }
                }
            ).setOrigin(0.5);

            label.setDepth(11);

            this.cars.set(player.id, car);
            this.labels.set(player.id, label);

            this.targets.set(player.id, {
                x: player.x,
                y: player.y,
                angle: player.angle
            });

            this.playerColors.set(
                player.id,
                playerColor
            );
        });

        // =====================================
        // KEYBOARD CONTROLS
        // =====================================

        this.keys = this.input.keyboard.addKeys({
            up: "UP",
            down: "DOWN",
            left: "LEFT",
            right: "RIGHT",
            w: "W",
            a: "A",
            s: "S",
            d: "D"
        });

        // =====================================
        // ENGINE SOUND
        // =====================================

        this.engineSound = this.sound.add("engine", {
            loop: true,
            volume: 0.3
        });

        this.audioUnlocked = false;
        this.previousCarPosition = null;

        // Unlock Phaser engine audio after user interaction.
        this.unlockAudio = () => {
            if (this.audioUnlocked) return;

            if (this.sound.locked) {
                this.sound.unlock();
            }

            this.audioUnlocked = true;
        };

        this.input.once(
            "pointerdown",
            this.unlockAudio
        );

        this.input.keyboard.once(
            "keydown",
            this.unlockAudio
        );

        this.inputTimer = 0;

        // =====================================
        // MAIN HUD
        // =====================================

        this.add.text(
            20,
            20,
            `🏎️ ${this.track.name}`,
            {
                fontSize: "20px",
                color: "#ffffff",
                backgroundColor: "#172554",
                padding: { x: 12, y: 8 },
                fontStyle: "bold"
            }
        ).setDepth(20);

        // Lap counter.
        this.lapText = this.add.text(
            20,
            75,
            "LAP: 0/3",
            {
                fontSize: "21px",
                color: "#ffffff",
                backgroundColor: "#172554",
                padding: { x: 12, y: 8 },
                fontStyle: "bold"
            }
        ).setDepth(20);

        // Minimap.
        this.miniMapGraphics = this.add.graphics();
        this.miniMapGraphics.setDepth(25);

        this.miniMapX = 910;
        this.miniMapY = 20;
        this.miniMapWidth = 270;
        this.miniMapHeight = 170;

        this.miniMapTitle = this.add.text(
            this.miniMapX + 12,
            this.miniMapY + 8,
            "CIRCUIT MAP",
            {
                fontSize: "13px",
                color: "#ffffff",
                fontStyle: "bold",
                letterSpacing: 2
            }
        ).setDepth(26);

        // Upcoming turn.
        this.turnText = this.add.text(
            925,
            200,
            "NEXT TURN: --",
            {
                fontSize: "16px",
                color: "#ffffff",
                backgroundColor: "#172554",
                padding: { x: 12, y: 9 },
                fontStyle: "bold"
            }
        ).setDepth(26);

        // Controls.
        this.add.text(
            20,
            740,
            "WASD / ARROW KEYS  |  ACCELERATE • BRAKE • STEER",
            {
                fontSize: "13px",
                color: "#ffffff",
                backgroundColor: "#172554",
                padding: { x: 10, y: 7 }
            }
        ).setDepth(20);

        // =====================================
        // SOCKET EVENT LISTENERS
        // =====================================

        this.handleRaceState =
            this.handleRaceState.bind(this);

        this.socket.on(
            "race-state",
            this.handleRaceState
        );

        // =====================================
        // SCENE CLEANUP
        // =====================================

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            () => {
                // Remove socket listener.
                this.socket.off(
                    "race-state",
                    this.handleRaceState
                );

                // Stop engine.
                if (this.engineSound) {
                    this.engineSound.stop();
                    this.engineSound.destroy();
                    this.engineSound = null;
                }

                // Remove audio unlock listeners.
                this.input.off(
                    "pointerdown",
                    this.unlockAudio
                );

                this.input.keyboard.off(
                    "keydown",
                    this.unlockAudio
                );

                // Reset player input.
                this.socket.emit("player-input", {
                    up: false,
                    down: false,
                    left: false,
                    right: false
                });
            }
        );

        this.drawMiniMap();
    }

    // =====================================
    // UPDATE MULTIPLAYER RACE STATE
    // =====================================

    handleRaceState(data) {
        const activePlayerIds = new Set(
            data.players.map(player => player.id)
        );

        // Remove disconnected players.
        this.cars.forEach((car, playerId) => {
            if (!activePlayerIds.has(playerId)) {
                car.destroy();

                const label = this.labels.get(playerId);

                if (label) {
                    label.destroy();
                }

                this.cars.delete(playerId);
                this.labels.delete(playerId);
                this.targets.delete(playerId);
                this.playerColors.delete(playerId);
            }
        });

        // Update player targets.
        data.players.forEach(player => {
            if (!this.cars.has(player.id)) return;

            this.targets.set(player.id, {
                x: player.x,
                y: player.y,
                angle: player.angle
            });
        });

        // Update local lap counter.
        const myPlayer = data.players.find(
            player => player.id === this.myId
        );

        if (myPlayer && this.lapText) {
            this.lapText.setText(
                `LAP: ${myPlayer.lap || 0}/3`
            );
        }
    }

    // Get finish-line geometry for selected map.
    getFinishGate() {
        const track = this.track;

        if (this.mapId === "grand-prix") {
            return {
                x: 600,
                y: 627,
                tangentX: 0,
                tangentY: 1,
                halfWidth: track.roadWidth / 2
            };
        }

        const points = track.centerLine;

        const start = points[0];
        const next = points[1];

        const dx = next.x - start.x;
        const dy = next.y - start.y;

        const length = Math.hypot(dx, dy);

        const tangentX = dx / length;
        const tangentY = dy / length;

        const normalX = -tangentY;
        const normalY = tangentX;

        const gateRatio = 0.85;

        return {
            x: start.x + dx * gateRatio,
            y: start.y + dy * gateRatio,
            tangentX: normalX,
            tangentY: normalY,
            halfWidth: track.roadWidth / 2
        };
    }

    // Calculate map-specific minimap scale.
    getMiniMapTransform() {
        const points = this.track.centerLine;

        const xs = points.map(point => point.x);
        const ys = points.map(point => point.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const availableWidth = this.miniMapWidth - 35;
        const availableHeight = this.miniMapHeight - 48;

        const scale = Math.min(
            availableWidth / (maxX - minX),
            availableHeight / (maxY - minY)
        );

        const renderedWidth = (maxX - minX) * scale;
        const renderedHeight = (maxY - minY) * scale;

        const offsetX =
            this.miniMapX +
            (this.miniMapWidth - renderedWidth) / 2;

        const offsetY =
            this.miniMapY +
            32 +
            (availableHeight - renderedHeight) / 2;

        return {
            x: value => offsetX + (value - minX) * scale,
            y: value => offsetY + (value - minY) * scale
        };
    }

    toMiniMap(x, y) {
        const transform = this.getMiniMapTransform();

        return {
            x: transform.x(x),
            y: transform.y(y)
        };
    }

    // Draw minimap and player positions.
    drawMiniMap() {
        const graphics = this.miniMapGraphics;
        const points = this.track.centerLine;

        graphics.clear();

        graphics.fillStyle(0x101827, 0.96);

        graphics.fillRoundedRect(
            this.miniMapX,
            this.miniMapY,
            this.miniMapWidth,
            this.miniMapHeight,
            12
        );

        graphics.lineStyle(2, 0x64748b, 1);

        graphics.strokeRoundedRect(
            this.miniMapX,
            this.miniMapY,
            this.miniMapWidth,
            this.miniMapHeight,
            12
        );

        const first = this.toMiniMap(
            points[0].x,
            points[0].y
        );

        graphics.lineStyle(10, 0x94a3b8, 1);

        graphics.beginPath();
        graphics.moveTo(first.x, first.y);

        for (let i = 1; i < points.length; i++) {
            const point = this.toMiniMap(
                points[i].x,
                points[i].y
            );

            graphics.lineTo(point.x, point.y);
        }

        graphics.strokePath();

        graphics.lineStyle(6, 0x343a40, 1);

        graphics.beginPath();
        graphics.moveTo(first.x, first.y);

        for (let i = 1; i < points.length; i++) {
            const point = this.toMiniMap(
                points[i].x,
                points[i].y
            );

            graphics.lineTo(point.x, point.y);
        }

        graphics.strokePath();

        const gate = this.getFinishGate();

        const finishA = this.toMiniMap(
            gate.x - gate.tangentX * gate.halfWidth,
            gate.y - gate.tangentY * gate.halfWidth
        );

        const finishB = this.toMiniMap(
            gate.x + gate.tangentX * gate.halfWidth,
            gate.y + gate.tangentY * gate.halfWidth
        );

        graphics.lineStyle(3, 0xffffff, 1);

        graphics.lineBetween(
            finishA.x,
            finishA.y,
            finishB.x,
            finishB.y
        );

        this.cars.forEach((car, playerId) => {
            const position = this.toMiniMap(
                car.x,
                car.y
            );

            const isMe = playerId === this.myId;

            const playerColor = isMe
                ? 0xff3333
                : (
                    this.playerColors.get(playerId) ||
                    0x00d9ff
                );

            graphics.fillStyle(playerColor, 1);

            graphics.fillCircle(
                position.x,
                position.y,
                isMe ? 5 : 4
            );

            graphics.lineStyle(1, 0xffffff, 1);

            graphics.strokeCircle(
                position.x,
                position.y,
                isMe ? 5 : 4
            );
        });
    }

    // Calculate upcoming turn.
    getUpcomingTurn(playerX, playerY) {
        const points = this.track.centerLine;
        const pointCount = points.length - 1;

        let closestIndex = 0;
        let closestDistance = Infinity;

        for (let i = 0; i < pointCount; i++) {
            const a = points[i];
            const b = points[i + 1];

            const dx = b.x - a.x;
            const dy = b.y - a.y;

            const lengthSquared = dx * dx + dy * dy;

            let t = 0;

            if (lengthSquared > 0) {
                t = (
                    (playerX - a.x) * dx +
                    (playerY - a.y) * dy
                ) / lengthSquared;
            }

            t = Phaser.Math.Clamp(t, 0, 1);

            const closestX = a.x + t * dx;
            const closestY = a.y + t * dy;

            const distance = Phaser.Math.Distance.Between(
                playerX,
                playerY,
                closestX,
                closestY
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        }

        const current = points[closestIndex];

        const next = points[
            (closestIndex + 1) % pointCount
        ];

        const nextNext = points[
            (closestIndex + 2) % pointCount
        ];

        const dx1 = next.x - current.x;
        const dy1 = next.y - current.y;

        const dx2 = nextNext.x - next.x;
        const dy2 = nextNext.y - next.y;

        const cross = dx1 * dy2 - dy1 * dx2;
        const dot = dx1 * dx2 + dy1 * dy2;

        const angle = Math.atan2(cross, dot);

        if (Math.abs(angle) < 0.25) {
            return "STRAIGHT";
        }

        return angle < 0 ? "LEFT" : "RIGHT";
    }

    // =====================================
    // MAIN GAME UPDATE
    // =====================================

    update(time, delta) {
        const alpha = 1 - Math.exp(-delta / 80);

        // Smooth player movement.
        this.cars.forEach((car, playerId) => {
            const target = this.targets.get(playerId);
            const label = this.labels.get(playerId);

            if (!target || !label) return;

            car.x = Phaser.Math.Linear(
                car.x,
                target.x,
                alpha
            );

            car.y = Phaser.Math.Linear(
                car.y,
                target.y,
                alpha
            );

            const angleDifference =
                Phaser.Math.Angle.Wrap(
                    target.angle - car.rotation
                );

            car.rotation += angleDifference * alpha;

            label.setPosition(
                car.x,
                car.y - 35
            );
        });

        this.drawMiniMap();

        const myCar = this.cars.get(this.myId);

        // =====================================
        // ENGINE SOUND
        // =====================================

        if (myCar && this.audioUnlocked) {
            if (!this.previousCarPosition) {
                this.previousCarPosition = {
                    x: myCar.x,
                    y: myCar.y
                };
            }

            const distance = Phaser.Math.Distance.Between(
                myCar.x,
                myCar.y,
                this.previousCarPosition.x,
                this.previousCarPosition.y
            );

            const speed =
                distance / Math.max(delta, 1) * 1000;

            this.previousCarPosition = {
                x: myCar.x,
                y: myCar.y
            };

            const normalizedSpeed = Phaser.Math.Clamp(
                speed / 300,
                0,
                1
            );

            if (normalizedSpeed > 0.02) {
                if (!this.engineSound.isPlaying) {
                    this.engineSound.play();
                }

                this.engineSound.setRate(
                    0.8 + normalizedSpeed * 0.9
                );

                this.engineSound.setVolume(
                    0.2 + normalizedSpeed * 0.45
                );
            } else {
                if (this.engineSound.isPlaying) {
                    this.engineSound.stop();
                }
            }
        }

        // =====================================
        // UPCOMING TURN INDICATOR
        // =====================================

        if (myCar && this.turnText) {
            const direction = this.getUpcomingTurn(
                myCar.x,
                myCar.y
            );

            this.turnText.setText(
                `NEXT TURN: ${direction}`
            );

            if (direction === "LEFT") {
                this.turnText.setColor("#38bdf8");
            } else if (direction === "RIGHT") {
                this.turnText.setColor("#fb923c");
            } else {
                this.turnText.setColor("#4ade80");
            }
        }

        // =====================================
        // SEND KEYBOARD INPUT AT 30 HZ
        // =====================================

        this.inputTimer += delta;

        if (this.inputTimer >= 1000 / 30) {
            this.inputTimer = 0;

            const input = {
                up:
                    this.keys.up.isDown ||
                    this.keys.w.isDown,

                down:
                    this.keys.down.isDown ||
                    this.keys.s.isDown,

                left:
                    this.keys.left.isDown ||
                    this.keys.a.isDown,

                right:
                    this.keys.right.isDown ||
                    this.keys.d.isDown
            };

            this.socket.emit("player-input", input);
        }
    }
}
