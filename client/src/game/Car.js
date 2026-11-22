
import Phaser from "phaser";

export default class Car extends Phaser.GameObjects.Container {

    constructor(scene, x, y, color = 0xff3333) {
        super(scene, x, y);

        // Physics properties (unchanged)
        this.speed = 0;
        this.maxSpeed = 300;
        this.acceleration = 220;
        this.braking = 350;
        this.reverseSpeed = -100;
        this.steeringSpeed = 2.8;

        this.carColor = color;

        // Main graphics
        this.shadow = scene.add.graphics();
        this.body = scene.add.graphics();

        this.add([this.shadow, this.body]);

        this.drawCar();

        scene.add.existing(this);
    }

    drawCar() {
        const g = this.body;
        const shadow = this.shadow;

        const color = this.carColor;
        const darkerColor = Phaser.Display.Color.IntegerToColor(color)
            .darken(25).color;
        const lighterColor = Phaser.Display.Color.IntegerToColor(color)
            .lighten(25).color;

        // =====================================
        // 1. CAR SHADOW
        // =====================================

        shadow.fillStyle(0x000000, 0.25);
        shadow.fillEllipse(1, 4, 43, 65);

        // =====================================
        // 2. TYRES
        // =====================================

        // Tyre sidewalls
        g.fillStyle(0x080808, 1);

        g.fillRoundedRect(-19, -18, 8, 17, 3);
        g.fillRoundedRect(11, -18, 8, 17, 3);

        g.fillRoundedRect(-19, 8, 8, 17, 3);
        g.fillRoundedRect(11, 8, 8, 17, 3);

        // Tyre highlights
        g.fillStyle(0x393939, 1);

        g.fillRect(-18, -16, 2, 12);
        g.fillRect(16, -16, 2, 12);

        g.fillRect(-18, 10, 2, 12);
        g.fillRect(16, 10, 2, 12);

        // =====================================
        // 3. SIDE SKIRTS
        // =====================================

        g.fillStyle(0x171717, 1);

        g.fillRoundedRect(-15, -13, 30, 35, 5);

        // =====================================
        // 4. MAIN CAR BODY
        // =====================================

        // Main aerodynamic shape
        g.fillStyle(darkerColor, 1);

        g.fillRoundedRect(-15, -27, 30, 55, 10);

        // Main painted surface
        g.fillStyle(color, 1);

        g.fillRoundedRect(-13, -28, 26, 54, 10);

        // Front bonnet
        g.fillStyle(lighterColor, 0.7);

        g.fillRoundedRect(-9, -25, 18, 13, 5);

        // Bonnet center highlight
        g.lineStyle(1.2, 0xffffff, 0.35);
        g.beginPath();
        g.moveTo(0, -24);
        g.lineTo(0, -13);
        g.strokePath();

        // =====================================
        // 5. FRONT BUMPER
        // =====================================

        g.fillStyle(0x171717, 1);
        g.fillRoundedRect(-11, -29, 22, 4, 2);

        // =====================================
        // 6. WINDSHIELD
        // =====================================

        g.fillStyle(0x111c29, 1);
        g.fillRoundedRect(-10, -15, 20, 15, 5);

        // Glass reflection
        g.fillStyle(0x9de3ff, 0.75);
        g.fillRoundedRect(-8, -13, 16, 10, 3);

        g.fillStyle(0xffffff, 0.25);
        g.fillRect(-6, -11, 2, 6);

        // Windshield frame
        g.lineStyle(1, 0x222222, 1);
        g.strokeRoundedRect(-10, -15, 20, 15, 5);

        // =====================================
        // 7. ROOF
        // =====================================

        g.fillStyle(darkerColor, 1);
        g.fillRoundedRect(-9, 1, 18, 12, 3);

        g.fillStyle(lighterColor, 0.3);
        g.fillRect(-6, 3, 2, 8);

        // =====================================
        // 8. REAR WINDOW
        // =====================================

        g.fillStyle(0x14202c, 1);
        g.fillRoundedRect(-9, 14, 18, 9, 3);

        g.fillStyle(0x80c8e8, 0.4);
        g.fillRect(-6, 16, 12, 2);

        // =====================================
        // 9. SIDE MIRRORS
        // =====================================

        g.fillStyle(0x111111, 1);

        g.fillRoundedRect(-17, -13, 5, 8, 2);
        g.fillRoundedRect(12, -13, 5, 8, 2);

        g.fillStyle(color, 1);

        g.fillRoundedRect(-17, -13, 4, 5, 2);
        g.fillRoundedRect(13, -13, 4, 5, 2);

        // =====================================
        // 10. HEADLIGHTS
        // =====================================

        // Headlight housings
        g.fillStyle(0x333333, 1);

        g.fillRoundedRect(-11, -28, 7, 4, 2);
        g.fillRoundedRect(4, -28, 7, 4, 2);

        // Headlight glow
        g.fillStyle(0xe8f8ff, 1);

        g.fillRoundedRect(-10, -28, 5, 3, 1);
        g.fillRoundedRect(5, -28, 5, 3, 1);

        // =====================================
        // 11. TAIL LIGHTS
        // =====================================

        g.fillStyle(0x590d0d, 1);

        g.fillRoundedRect(-11, 23, 7, 4, 1);
        g.fillRoundedRect(4, 23, 7, 4, 1);

        g.fillStyle(0xff2222, 1);

        g.fillRoundedRect(-10, 24, 5, 2, 1);
        g.fillRoundedRect(5, 24, 5, 2, 1);

        // =====================================
        // 12. REAR DIFFUSER
        // =====================================

        g.fillStyle(0x111111, 1);
        g.fillRoundedRect(-9, 27, 18, 3, 1);

        g.fillStyle(0x777777, 1);

        g.fillRect(-5, 27, 1, 3);
        g.fillRect(0, 27, 1, 3);
        g.fillRect(4, 27, 1, 3);

        // =====================================
        // 13. FINAL BODY OUTLINE
        // =====================================

        g.lineStyle(1, 0xffffff, 0.3);
        g.strokeRoundedRect(-13, -28, 26, 54, 10);
    }

    update(keys, delta) {

        const dt = delta / 1000;

        // Acceleration
        if (keys.up.isDown || keys.w.isDown) {
            this.speed += this.acceleration * dt;
        }

        // Braking and reverse
        else if (keys.down.isDown || keys.s.isDown) {

            if (this.speed > 0) {
                this.speed -= this.braking * dt;
            } else {
                this.speed -= this.acceleration * dt;
            }
        }

        // Friction
        else {
            this.speed *= Math.pow(0.985, dt * 60);
        }

        // Speed limit
        this.speed = Phaser.Math.Clamp(
            this.speed,
            this.reverseSpeed,
            this.maxSpeed
        );

        // Steering
        const steering = this.speed >= 0 ? 1 : -1;

        if (keys.left.isDown || keys.a.isDown) {
            this.rotation -=
                this.steeringSpeed * dt *
                Math.min(Math.abs(this.speed) / 100, 1) * steering;
        }

        if (keys.right.isDown || keys.d.isDown) {
            this.rotation +=
                this.steeringSpeed * dt *
                Math.min(Math.abs(this.speed) / 100, 1) * steering;
        }

        // Movement
        this.x += Math.sin(this.rotation) * this.speed * dt;
        this.y -= Math.cos(this.rotation) * this.speed * dt;
    }
}
