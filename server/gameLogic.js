
const TRACKS = {
    "grand-prix": {
        id: "grand-prix",
        roadWidth: 128,
        centerLine: [
            { x: 133, y: 627 },
            { x: 973, y: 627 },
            { x: 1053, y: 593 },
            { x: 1093, y: 533 },
            { x: 1093, y: 467 },
            { x: 1053, y: 420 },
            { x: 987, y: 400 },
            { x: 840, y: 400 },
            { x: 787, y: 360 },
            { x: 787, y: 273 },
            { x: 827, y: 227 },
            { x: 1013, y: 227 },
            { x: 1073, y: 187 },
            { x: 1073, y: 140 },
            { x: 1027, y: 100 },
            { x: 240, y: 100 },
            { x: 187, y: 140 },
            { x: 187, y: 313 },
            { x: 227, y: 367 },
            { x: 373, y: 367 },
            { x: 440, y: 407 },
            { x: 467, y: 467 },
            { x: 467, y: 520 },
            { x: 427, y: 560 },
            { x: 253, y: 560 },
            { x: 193, y: 587 },
            { x: 133, y: 627 }
        ]
    },

    triangle: {
        id: "triangle",
        roadWidth: 128,
        centerLine: [
            { x: 600, y: 105 },
            { x: 1080, y: 680 },
            { x: 120, y: 680 },
            { x: 600, y: 105 }
        ]
    },

    "figure-eight": {
        id: "figure-eight",
        roadWidth: 112,
        centerLine: [
            { x: 1000, y: 400 },
            { x: 900, y: 220 },
            { x: 600, y: 400 },
            { x: 300, y: 580 },
            { x: 200, y: 400 },
            { x: 300, y: 220 },
            { x: 600, y: 400 },
            { x: 900, y: 580 },
            { x: 1000, y: 400 }
        ]
    },

    snake: {
        id: "snake",
        roadWidth: 116,
        centerLine: [
            { x: 350, y: 650 },
            { x: 460, y: 560 },
            { x: 350, y: 460 },
            { x: 240, y: 350 },
            { x: 350, y: 245 },
            { x: 550, y: 245 },
            { x: 700, y: 350 },
            { x: 850, y: 455 },
            { x: 1010, y: 350 },
            { x: 1050, y: 210 },
            { x: 870, y: 115 },
            { x: 660, y: 150 },
            { x: 500, y: 100 },
            { x: 300, y: 120 },
            { x: 150, y: 250 },
            { x: 150, y: 650 },
            { x: 350, y: 650 }
        ]
    }
};

const MAX_SPEED = 300;
const ACCELERATION = 220;
const BRAKING = 350;
const REVERSE_SPEED = -100;
const STEERING_SPEED = 2.8;

const FINISH_GATE_RATIO = 0.85;
const SPAWN_DISTANCE_BEFORE_GATE = 85;

function getTrack(mapId) {
    return TRACKS[mapId] || TRACKS["grand-prix"];
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
        return Math.hypot(px - x1, py - y1);
    }

    let t =
        ((px - x1) * dx + (py - y1) * dy) /
        lengthSquared;

    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    return Math.hypot(px - closestX, py - closestY);
}

function isOnTrack(x, y, mapId) {
    const track = getTrack(mapId);
    const points = track.centerLine;
    const halfRoadWidth = track.roadWidth / 2;

    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];

        const distance = distanceToSegment(
            x, y,
            a.x, a.y,
            b.x, b.y
        );

        if (distance <= halfRoadWidth) {
            return true;
        }
    }

    return false;
}

// Finish gate geometry.

function getFinishGate(track) {

    // Grand Prix: vertical finish line at x = 600.
    if (track.id === "grand-prix") {
        return {
            gateX: 600,
            gateY: 627,

            // Across the road.
            tangentX: 0,
            tangentY: 1,

            // Forward racing direction.
            normalX: 1,
            normalY: 0
        };
    }

    const start = track.centerLine[0];
    const next = track.centerLine[1];

    const dx = next.x - start.x;
    const dy = next.y - start.y;

    const length = Math.hypot(dx, dy);

    // Forward direction along the track.
    const normalX = dx / length;
    const normalY = dy / length;

    // Perpendicular direction across the road.
    const tangentX = -normalY;
    const tangentY = normalX;

    const gateDistance = length * FINISH_GATE_RATIO;

    return {
        gateX: start.x + normalX * gateDistance,
        gateY: start.y + normalY * gateDistance,

        tangentX,
        tangentY,

        normalX,
        normalY
    };
}


// Initialize race.
function initializeRace(room) {
    const track = getTrack(room.selectedMap);

    const start = track.centerLine[0];
    const next = track.centerLine[1];

    const dx = next.x - start.x;
    const dy = next.y - start.y;
    const length = Math.hypot(dx, dy);

    const tangentX = dx / length;
    const tangentY = dy / length;

    const normalX = -tangentY;
    const normalY = tangentX;

    const gateDistance =
        track.id === "grand-prix"
            ? 600 - start.x
            : length * FINISH_GATE_RATIO;

    room.players.forEach((player, index) => {
        const column = index % 5;
        const row = Math.floor(index / 5);

        const lateralOffset = (column - 2) * 19;

        const forwardOffset =
            gateDistance -
            SPAWN_DISTANCE_BEFORE_GATE -
            row * 42;

        player.x =
            start.x +
            tangentX * forwardOffset +
            normalX * lateralOffset;

        player.y =
            start.y +
            tangentY * forwardOffset +
            normalY * lateralOffset;

        player.angle = Math.atan2(tangentX, -tangentY);

        player.speed = 0;
        player.lap = 0;

        player.previousX = player.x;
        player.previousY = player.y;

        // Player starts on the negative side of the gate.
        player.lapGateArmed = true;

        player.input = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    });

    console.log(`Race initialized on map: ${track.id}`);
}

// Check whether the player crossed the finish gate forward.
function crossedFinishLine(player, track) {
    const gate = getFinishGate(track);

    const previousSide =
        (player.previousX - gate.gateX) * gate.normalX +
        (player.previousY - gate.gateY) * gate.normalY;

    const currentSide =
        (player.x - gate.gateX) * gate.normalX +
        (player.y - gate.gateY) * gate.normalY;

    if (!(previousSide < 0 && currentSide >= 0)) {
        return false;
    }

    const denominator = previousSide - currentSide;

    if (denominator === 0) {
        return false;
    }

    const t = previousSide / denominator;

    const crossingX =
        player.previousX +
        (player.x - player.previousX) * t;

    const crossingY =
        player.previousY +
        (player.y - player.previousY) * t;

    const lateralDistance =
        (crossingX - gate.gateX) * gate.tangentX +
        (crossingY - gate.gateY) * gate.tangentY;

    return Math.abs(lateralDistance) <= track.roadWidth / 2;
}

// Update player physics and lap tracking.
function updatePlayer(player, dt, mapId) {
    const input = player.input;
    const track = getTrack(mapId);

    // Save old position before movement.
    const previousX = player.x;
    const previousY = player.y;

    if (input.up) {
        player.speed += ACCELERATION * dt;
    } else if (input.down) {
        if (player.speed > 0) {
            player.speed -= BRAKING * dt;
        } else {
            player.speed -= ACCELERATION * dt;
        }
    } else {
        player.speed *= Math.pow(0.985, dt * 60);
    }

    player.speed = Math.max(
        REVERSE_SPEED,
        Math.min(MAX_SPEED, player.speed)
    );

    const direction = player.speed >= 0 ? 1 : -1;

    const steeringAmount =
        STEERING_SPEED *
        dt *
        Math.min(Math.abs(player.speed) / 100, 1);

    if (input.left) {
        player.angle -= steeringAmount * direction;
    }

    if (input.right) {
        player.angle += steeringAmount * direction;
    }

    const nextX =
        player.x +
        Math.sin(player.angle) * player.speed * dt;

    const nextY =
        player.y -
        Math.cos(player.angle) * player.speed * dt;

    if (isOnTrack(nextX, nextY, mapId)) {
        player.x = nextX;
        player.y = nextY;
    } else {
        player.speed *= 0.5;
    }

    // Store previous position for crossing detection.
    player.previousX = previousX;
    player.previousY = previousY;

    const gate = getFinishGate(track);

    const currentSide =
        (player.x - gate.gateX) * gate.normalX +
        (player.y - gate.gateY) * gate.normalY;

    // Rearm only after the player has returned sufficiently
    // behind the finish line.
    if (currentSide < -(track.roadWidth * 0.4)) {
        player.lapGateArmed = true;
    }

    if (
        player.lapGateArmed &&
        crossedFinishLine(player, track)
    ) {
        player.lap++;
        player.lapGateArmed = false;

        console.log(
            `${player.username} completed lap ${player.lap}`
        );
    }
}

// Resolve collisions between cars.
function resolveCarCollisions(players, mapId) {
    const COLLISION_RADIUS = 18;
    const COLLISION_DISTANCE = COLLISION_RADIUS * 2;

    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            const carA = players[i];
            const carB = players[j];

            const dx = carB.x - carA.x;
            const dy = carB.y - carA.y;

            const distance = Math.hypot(dx, dy);

            if (distance >= COLLISION_DISTANCE) {
                continue;
            }

            let nx;
            let ny;

            if (distance === 0) {
                nx = 1;
                ny = 0;
            } else {
                nx = dx / distance;
                ny = dy / distance;
            }

            const overlap = COLLISION_DISTANCE - distance;
            const halfOverlap = overlap / 2;

            const ax = carA.x - nx * halfOverlap;
            const ay = carA.y - ny * halfOverlap;

            const bx = carB.x + nx * halfOverlap;
            const by = carB.y + ny * halfOverlap;

            const canMoveA = isOnTrack(ax, ay, mapId);
            const canMoveB = isOnTrack(bx, by, mapId);

            if (canMoveA && canMoveB) {
                carA.x = ax;
                carA.y = ay;

                carB.x = bx;
                carB.y = by;
            } else if (canMoveA) {
                const newAx = carA.x - nx * overlap;
                const newAy = carA.y - ny * overlap;

                if (isOnTrack(newAx, newAy, mapId)) {
                    carA.x = newAx;
                    carA.y = newAy;
                }
            } else if (canMoveB) {
                const newBx = carB.x + nx * overlap;
                const newBy = carB.y + ny * overlap;

                if (isOnTrack(newBx, newBy, mapId)) {
                    carB.x = newBx;
                    carB.y = newBy;
                }
            }

            carA.speed *= 0.7;
            carB.speed *= 0.7;
        }
    }
}

module.exports = {
    TRACKS,
    getTrack,
    initializeRace,
    updatePlayer,
    resolveCarCollisions
};
