import * as THEME from "../configs/Field";
import * as GAME from "../configs/Game";
import HexLabelComponent from "../components/HexLabelComponent";

type Point = {
    x: number;
    y: number;
};

export default class GameView extends Phaser.GameObjects.Container {
    private readonly isPointyHexes = false; // cause JWST use flat top hexes
    private readonly partOfShortSizeUsed = 0.9;
    private currCenter: Point;
    private prevCenter: Point;
    private currHexRadius: number;

    private allHexes: Phaser.GameObjects.Polygon[] = [];
    private readonly allLabels: HexLabelComponent[] = [];

    public constructor(scene: Phaser.Scene) {
        super(scene);
        this.setCoordinates();
        this.draw();
        //this.updateLabelsData();
    }

    // should receive array of strings with new labels' values
    public updateLabelsData(values: number[]): void {
        //this.allLabels.forEach((label, index) => label.setText(index.toString().padStart(2, "0")));
        this.allLabels.forEach((label, i) => {
            if (values[i] !== null) {
                if (values[i] === 0) label.setText("");
                else label.setValue(values[i]);
            }
        });
    }

    public updatePosition(): void {
        this.setCoordinates();
        //this.readjustHexes();
        //this.updateLabels();
        const shift: Point = {
            x: this.currCenter.x - this.prevCenter.x,
            y: this.currCenter.y - this.prevCenter.y,
        };
        this.setPosition(this.x + shift.x, this.y + shift.y);
    }

    private setCoordinates(): void {
        this.prevCenter = this.currCenter;
        const { width, height } = this.scene.scale.gameSize;
        this.currCenter = { x: width / 2, y: height / 2 };
        let radius: number = height > width ? width : height;
        radius = (radius / Math.sqrt(3) / 2) * this.partOfShortSizeUsed;
        this.currHexRadius = radius / GAME.SIZE;
    }

    private readjustHexes(): void {
        console.log(this.currCenter, this.prevCenter);
        const shift: Point = {
            x: (this.currCenter.x - this.prevCenter.x) / 2,
            y: (this.currCenter.y - this.prevCenter.y) / 2,
        };
        console.log(shift);
        this.allHexes.forEach((hex, i) => {
            const hexCenter = hex.getCenter();
            if (i === 0) console.log(`${i}: ${hexCenter.x},${hexCenter.y}`);
            hex.setPosition(hexCenter.x + shift.x, hexCenter.y + shift.y);
            if (i === 0) console.log(`${i}: ${hex.getCenter().x},${hex.getCenter().y}`);
        });
    }

    private draw(): void {
        let distance2CornerHex: number = this.currHexRadius * Math.sqrt(3);

        const hexesCenters: Point[] = [];

        // first hex is in the center
        hexesCenters.push(this.currCenter);

        // first circle (fieldSize == 2, 6 hexes)
        // !(not use pointy hexes) here to get centers at the right position
        hexesCenters.push(...this.getHexVertices(this.currCenter, distance2CornerHex, true));

        // array of not corner (interim) hexes
        let newHexesCenters: Point[] = [];
        let interimHexesCenters: Point[] = [];
        for (let s = 2; s < GAME.SIZE; s++) {
            distance2CornerHex += this.currHexRadius * Math.sqrt(3);
            newHexesCenters = this.getHexVertices(this.currCenter, distance2CornerHex, true);
            interimHexesCenters = this.getInterimHexCenters(newHexesCenters, s);

            //starting to insert interim hexes from the second position
            let i = 1;
            let iHex: Point | undefined;
            while (interimHexesCenters.length > 0) {
                for (let j = 0; j < s - 1; j++) {
                    iHex = interimHexesCenters.shift();
                    if (iHex) newHexesCenters.splice(i, 0, iHex);
                    i++;
                }
                i++; //skipping next corner hex
            }
            hexesCenters.push(...newHexesCenters);
        }
        hexesCenters.forEach((hexCenter) => {
            const hex = this.hex(hexCenter, this.currHexRadius);
            this.add(hex);
            this.allHexes.push(hex);
        });

        this.createLabels();
        this.updateLabels();
    }

    private updateLabels(): void {
        this.allHexes.forEach((hex, i) => {
            this.allLabels[i].setPosition(hex.x, hex.y);
            this.allLabels[i].setFontSizeOnHexSize(this.currHexRadius);
        });
    }

    private createLabels(): void {
        this.allHexes.forEach(() => {
            const label = new HexLabelComponent(this.scene, 0, 0);
            this.add(label);
            this.allLabels.push(label);
        });
    }

    private getInterimHexCenters(cornerHexesCenters: Point[], circleNum: number): Point[] {
        const interimHexesCenters: Point[] = [];
        let nextCornerHexCenter: Point;
        const shift: Point = { x: 0, y: 0 }; // shift between interim hexes' centers

        for (let i = 0; i < cornerHexesCenters.length; i++) {
            if (cornerHexesCenters[i + 1] !== undefined) nextCornerHexCenter = cornerHexesCenters[i + 1];
            else nextCornerHexCenter = cornerHexesCenters[0];

            shift.x = nextCornerHexCenter.x - cornerHexesCenters[i].x;
            shift.x /= circleNum;

            shift.y = nextCornerHexCenter.y - cornerHexesCenters[i].y;
            shift.y /= circleNum;

            for (let j = 1; j < circleNum; j++) {
                interimHexesCenters.push({
                    x: cornerHexesCenters[i].x + shift.x * j,
                    y: cornerHexesCenters[i].y + shift.y * j,
                });
            }
        }
        return interimHexesCenters;
    }

    private hex(center: Point, radius: number): Phaser.GameObjects.Polygon {
        const vertices: Point[] = this.getHexVertices({ x: 0, y: 0 }, radius);
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
    private getHexVertices(center: Point, radius: number, isHexCenters = false): Point[] {
        const vertices: Point[] = [];
        let angle: number;
        if (this.isPointyHexes || isHexCenters) angle = 180 + 30; // in degrees
        else angle = 180;
        for (let i = 0; i < 6; i++) {
            angle += 60;
            vertices.push({
                x: center.x + radius * Math.cos((angle * Math.PI) / 180),
                y: center.y + radius * Math.sin((angle * Math.PI) / 180),
            });
        }
        return vertices;
    }
}
