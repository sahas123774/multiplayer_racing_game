
const GRAND_PRIX = {
    id: "grand-prix",
    name: "GRAND PRIX CIRCUIT",
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
};

const TRIANGLE = {
    id: "triangle",
    name: "TRIANGLE RACEWAY",
    roadWidth: 128,
    centerLine: [
        { x: 600, y: 105 },
        { x: 1080, y: 680 },
        { x: 120, y: 680 },
        { x: 600, y: 105 }
    ]
};

const FIGURE_EIGHT = {
    id: "figure-eight",
    name: "FIGURE-8 CIRCUIT",
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
};

const SNAKE = {
    id: "snake",
    name: "SNAKE CIRCUIT",
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
};

export const TRACKS = {
    "grand-prix": GRAND_PRIX,
    triangle: TRIANGLE,
    "figure-eight": FIGURE_EIGHT,
    snake: SNAKE
};

export const MAP_OPTIONS = [
    {
        id: "grand-prix",
        name: "Grand Prix",
        description: "Technical F1-style circuit",
        difficulty: "Medium"
    },
    {
        id: "triangle",
        name: "Triangle Raceway",
        description: "Three long sides and sharp corners",
        difficulty: "Easy"
    },
    {
        id: "figure-eight",
        name: "Figure-8",
        description: "Two connected loops and a crossover",
        difficulty: "Hard"
    },
    {
        id: "snake",
        name: "Snake Circuit",
        description: "Winding turns and changing directions",
        difficulty: "Hard"
    }
];

export const TRACK = GRAND_PRIX;

export function getTrack(mapId) {
    return TRACKS[mapId] || TRACKS["grand-prix"];
}

export function createTrack(scene, mapId = "grand-prix") {
    const track = getTrack(mapId);
    const graphics = scene.add.graphics();
    const points = track.centerLine;

    graphics.fillStyle(0x347b40, 1);
    graphics.fillRect(0, 0, 1200, 800);

    graphics.fillStyle(0x286536, 0.45);
    graphics.fillEllipse(600, 400, 350, 220);
    graphics.fillEllipse(600, 400, 240, 150);

    // Outer safety barrier
    graphics.lineStyle(track.roadWidth + 30, 0x20252b, 1);
    drawTrackPath(graphics, points);

    // Red kerbs
    graphics.lineStyle(track.roadWidth + 18, 0xe53935, 1);
    drawTrackPath(graphics, points);

    // White kerb stripes
    graphics.lineStyle(track.roadWidth + 10, 0xf8fafc, 1);
    drawDashedTrackPath(graphics, points, 28, 28);

    // Asphalt
    graphics.lineStyle(track.roadWidth, 0x343a40, 1);
    drawTrackPath(graphics, points);

    // Racing guide
    graphics.lineStyle(2, 0xffffff, 0.22);
    drawDashedTrackPath(graphics, points, 18, 25);

    // Start / finish line
    drawFinishLine(graphics, track);

    scene.add.text(600, 35, track.name, {
        fontSize: "22px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#172554",
        padding: { x: 12, y: 7 }
    }).setOrigin(0.5);

    // Grand Prix decorations
    if (mapId === "grand-prix") {
        drawGrandstand(graphics, 360, 35, 180, 24);
        drawGrandstand(graphics, 700, 35, 180, 24);
        drawGrandstand(graphics, 30, 390, 25, 100);
        drawGrandstand(graphics, 1145, 290, 25, 100);

        scene.add.text(600, 716, "PIT LANE", {
            fontSize: "15px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        graphics.lineStyle(3, 0xffffff, 0.8);
        graphics.lineBetween(300, 700, 900, 700);
        graphics.lineBetween(300, 735, 900, 735);

        graphics.lineStyle(2, 0xffd54f, 1);
        graphics.lineBetween(300, 700, 300, 735);
        graphics.lineBetween(900, 700, 900, 735);
    }

    if (mapId === "triangle") {
        scene.add.text(600, 390, "APEX TRIANGLE", {
            fontSize: "25px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5).setAlpha(0.65);
    }

    if (mapId === "figure-eight") {
        scene.add.text(600, 390, "CROSSOVER", {
            fontSize: "19px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5).setAlpha(0.7);
    }

    if (mapId === "snake") {
        scene.add.text(600, 390, "SNAKE RUN", {
            fontSize: "25px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5).setAlpha(0.65);
    }

    return track;
}

function drawTrackPath(graphics, points) {
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
    }

    graphics.strokePath();
}

function drawDashedTrackPath(graphics, points, dashLength, gapLength) {
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.hypot(dx, dy);

        if (length === 0) continue;

        const ux = dx / length;
        const uy = dy / length;

        let position = 0;

        while (position < length) {
            const end = Math.min(position + dashLength, length);

            graphics.lineBetween(
                a.x + ux * position,
                a.y + uy * position,
                a.x + ux * end,
                a.y + uy * end
            );

            position += dashLength + gapLength;
        }
    }
}

function drawFinishLine(graphics, track) {
    // Grand Prix finish line: middle of bottom straight.
    if (track.id === "grand-prix") {
        const centerX = 600;
        const centerY = 627;
        const halfWidth = track.roadWidth / 2;

        const cellSize = 12;
        const rows = Math.ceil((halfWidth * 2) / cellSize);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < 2; col++) {
                const color =
                    (row + col) % 2 === 0
                        ? 0xffffff
                        : 0x111111;

                graphics.fillStyle(color, 1);

                graphics.fillRect(
                    centerX - cellSize + col * cellSize,
                    centerY - halfWidth + row * cellSize,
                    cellSize,
                    cellSize
                );
            }
        }

        graphics.lineStyle(3, 0xffffff, 1);
        graphics.lineBetween(
            centerX - cellSize,
            centerY - halfWidth,
            centerX - cellSize,
            centerY + halfWidth
        );

        graphics.lineBetween(
            centerX + cellSize,
            centerY - halfWidth,
            centerX + cellSize,
            centerY + halfWidth
        );

        return;
    }

    // Other maps: calculate finish gate at 85% of first segment.
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

    const centerX = start.x + dx * gateRatio;
    const centerY = start.y + dy * gateRatio;

    const halfWidth = track.roadWidth / 2;

    const a = {
        x: centerX + normalX * halfWidth,
        y: centerY + normalY * halfWidth
    };

    const b = {
        x: centerX - normalX * halfWidth,
        y: centerY - normalY * halfWidth
    };

    graphics.lineStyle(10, 0xffffff, 1);
    graphics.lineBetween(a.x, a.y, b.x, b.y);

    graphics.lineStyle(4, 0x111111, 1);
    graphics.lineBetween(a.x, a.y, b.x, b.y);

    const cellCount = 12;

    for (let i = 0; i < cellCount; i++) {
        const t = (i + 0.5) / cellCount;

        graphics.fillStyle(
            i % 2 === 0 ? 0xffffff : 0x111111,
            1
        );

        graphics.fillCircle(
            PhaserPoint(a.x, b.x, t),
            PhaserPoint(a.y, b.y, t),
            4
        );
    }
}

function PhaserPoint(a, b, t) {
    return a + (b - a) * t;
}

function drawGrandstand(graphics, x, y, width, height) {
    graphics.fillStyle(0x64748b, 1);
    graphics.fillRoundedRect(x, y, width, height, 5);

    graphics.lineStyle(2, 0xcbd5e1, 0.8);

    for (let i = 1; i < 6; i++) {
        graphics.lineBetween(
            x + (width / 6) * i,
            y + 3,
            x + (width / 6) * i,
            y + height - 3
        );
    }
}

export function isOnTrack(x, y, mapId = "grand-prix") {
    const track = getTrack(mapId);
    const points = track.centerLine;
    const halfWidth = track.roadWidth / 2;

    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const lengthSquared = dx * dx + dy * dy;

        let t = 0;

        if (lengthSquared > 0) {
            t = (
                (x - a.x) * dx +
                (y - a.y) * dy
            ) / lengthSquared;
        }

        t = Math.max(0, Math.min(1, t));

        const closestX = a.x + t * dx;
        const closestY = a.y + t * dy;

        if (
            Math.hypot(x - closestX, y - closestY) <= halfWidth
        ) {
            return true;
        }
    }

    return false;
}
