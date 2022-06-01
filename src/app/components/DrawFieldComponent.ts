import * as THEME from "../configs/FieldVisuals";

export class DrawFieldComponent extends Phaser.GameObjects.Container {
    private readonly pointyHexes = false; // cause JWST use flat top hexes
    private readonly allHexes: Phaser.GameObjects.Polygon[] = [];

    public constructor(scene: Phaser.Scene) {
        super(scene);
        this.field();
    }

    private field(): void {
        const { width, height } = this.scene.scale.gameSize;
        this.allHexes.push(this.hex({ x: width / 2, y: height / 2 }, 100));
    }

    private hex(center: Phaser.Types.GameObjects.Graphics.Options, radius: number): Phaser.GameObjects.Polygon {
        const vertices: Phaser.Types.GameObjects.Graphics.Options[] = this.getHexVertices(radius);
        const hex: Phaser.GameObjects.Polygon = this.scene.add.polygon(
            center.x,
            center.y,
            vertices,
            THEME.JWST.cHexFill,
            THEME.JWST.aHexFill,
        );
        hex.setStrokeStyle(THEME.JWST.wLine, THEME.JWST.cLine, THEME.JWST.aLine);
        hex.setOrigin(0, 0);
        return hex;
    }

    // returns hex vertices
    // also used to get corner's hexes centers
    private getHexVertices(radius: number): Phaser.Types.GameObjects.Graphics.Options[] {
        const vertices: Phaser.Types.GameObjects.Graphics.Options[] = [];
        let angle: number;
        if (this.pointyHexes) angle = 180 + 30; // in degrees
        else angle = 180;
        for (let i = 0; i < 6; i++) {
            angle += 60;
            vertices.push({
                x: radius * Math.cos((angle * Math.PI) / 180),
                y: radius * Math.sin((angle * Math.PI) / 180),
            });
        }
        return vertices;
    }
}
