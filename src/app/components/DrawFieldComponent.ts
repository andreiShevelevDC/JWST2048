import * as THEME from "../configs/FieldVisuals";

export class DrawFieldComponent extends Phaser.GameObjects.Container {
    private readonly pointyHexes = false; // cause JWST use flat top hexes

    public constructor(scene: Phaser.Scene) {
        super(scene);
        this.field();
    }

    private field(): void {
        const { width, height } = this.scene.scale.gameSize;
        this.hex({ x: width / 2, y: height / 2 }, 100);
    }

    private hex(center: Phaser.Types.GameObjects.Graphics.Options, radius: number): Phaser.GameObjects.Polygon {
        const vertices = this.getHexVertices(center, radius);
        const hex = new Phaser.GameObjects.Polygon(
            this.scene,
            center.x,
            center.y,
            vertices,
            THEME.JWST.cHexFill,
            THEME.JWST.aHexFill,
        );
        hex.setStrokeStyle(THEME.JWST.wLine, THEME.JWST.cLine, THEME.JWST.aLine);
        // hex.lineStyle(THEME.JWST.wLine, THEME.JWST.cLine, THEME.JWST.aLine);
        // hex.beginPath();
        //
        // hex.moveTo(vertices[0][0], vertices[0][1]);
        // for (let i = 1; i < vertices.length; i++) {
        //     hex.lineTo(vertices[i].x, vertices[i].y);
        // }
        // hex.closePath();
        // hex.strokePath();
        this.add(hex);
        return hex;
    }

    // returns hex vertices
    // also used to get corner's hexes centers
    private getHexVertices(
        center: Phaser.Types.GameObjects.Graphics.Options,
        radius: number,
    ): Phaser.Types.GameObjects.Graphics.Options[] {
        const vertices: Phaser.Types.GameObjects.Graphics.Options[] = [];
        let angle: number;
        if (this.pointyHexes) angle = 180 + 30; // in degrees
        else angle = 180;
        for (let i = 0; i < 6; i++) {
            angle += 60;
            if (center.x && center.y) {
                vertices.push({
                    x: center.x + radius * Math.cos((angle * Math.PI) / 180),
                    y: center.y + radius * Math.sin((angle * Math.PI) / 180),
                });
            }
        }
        return vertices;
    }
}
