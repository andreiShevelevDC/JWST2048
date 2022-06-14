import * as THEME from "../configs/Field";
import * as GAME from "../configs/Game";
import HexLabelComponent from "../components/HexLabelComponent";

type Point = {
    x: number;
    y: number;
};

type HexIdleAnimation = {
    index: number;
    alphaLow: number;
    duration: number;
};

export default class GameView extends Phaser.GameObjects.Container {
    private readonly isPointyHexes = false; // cause JWST use flat top hexes
    private readonly partOfShortSizeUsed = 0.9;
    private currCenter: Point;
    private prevCenter: Point;
    private currHexRadius = 0;
    private prevHexRadius: number;

    private allHexes: Phaser.GameObjects.Polygon[] = [];
    private readonly allLabels: HexLabelComponent[] = [];
    private gameEvents: Phaser.Events.EventEmitter;
    private videoBacks: Phaser.GameObjects.Video[] = [];
    private currVideoNum: number;

    public constructor(scene: Phaser.Scene) {
        super(scene);
        this.setCoordinates();
        this.showVideoBack();
        //this.updateVideoBackPosition();
        this.draw();
        //this.updateLabelsData();
        this.runIdleAnimation(true);
    }

    public registerEventHandler(gameEvents: Phaser.Events.EventEmitter): void {
        this.gameEvents = gameEvents;
    }

    // should receive array of strings with new labels' values
    public updateLabelsData(values: number[]): void {
        //this.allLabels.forEach((label, index) => label.setText(index.toString().padStart(2, "0")));
        this.allLabels.forEach((label, i) => {
            if (values[i] !== null) {
                if (values[i] === 0) label.setText("");
                else {
                    label.setValue(values[i]);
                    label.setAlpha(1.0);
                }
            }
        });
    }

    public updatePosition(): void {
        this.setCoordinates();
        this.updateVideoBackPosition();
        //this.readjustHexes();
        //this.updateLabels();
        // console.log("Scale: ", this.scale);
        // let scaleRate = 1;
        // console.log(this.currHexRadius, this.prevHexRadius);
        // if (this.prevHexRadius) scaleRate = this.currHexRadius / this.prevHexRadius;
        // this.setScale(scaleRate);
        //console.log(this.width, this.height);
        const shift: Point = {
            x: this.currCenter.x - this.prevCenter.x,
            y: this.currCenter.y - this.prevCenter.y,
        };
        this.setPosition(this.x + shift.x, this.y + shift.y);
    }

    public tweenMergedTiles(hexIndices: number[]): void {
        hexIndices.forEach((index) => {
            this.scene.tweens.add({
                targets: this.allHexes[index],
                scale: 1.2,
                ease: "Sine.easeInOut",
                duration: 300,
                repeat: 0,
                yoyo: true,
            });
            this.allLabels[index].setStyle({ color: "#ff0000" });
            this.scene.tweens.add({
                targets: this.allLabels[index],
                scale: 1.7,
                ease: "Sine.easeInExpo",
                duration: 300,
                repeat: 0,
                yoyo: true,
                onComplete: () => this.allLabels[index].setStyle({ color: THEME.JWST_LABEL.color }),
            });
        });
    }

    public tweenLoseGame(): void {
        this.scene.tweens.add({
            targets: this.allHexes,
            alpha: 0.0,
            scale: 0.1,
            ease: "Sine.easeInExpo",
            duration: 2000,
            repeat: 0,
            onComplete: () => {
                this.gameEvents.emit(GAME.EVENT.SHOWRESULTS);
            },
        });
    }

    public tweenWinGame(): void {
        this.scene.tweens.add({
            targets: this.allHexes,
            alpha: 0.8,
            scale: 20,
            ease: "Sine.easeInExpo",
            duration: 1500,
            repeat: 0,
            onComplete: () => {
                this.gameEvents.emit(GAME.EVENT.SHOWRESULTS);
            },
        });
        this.scene.tweens.add({
            targets: this.allLabels,
            alpha: 0.0,
            scale: 50,
            ease: "Sine.easeInExpo",
            duration: 800,
            repeat: 0,
        });
    }

    public tweenShiftedTiles(hexIndices: number[], dirVector: number[]): void {
        let i = hexIndices.length;
        let angle: number;
        switch (dirVector) {
            case GAME.DIRECTION.Q:
                angle = -150;
                break;
            case GAME.DIRECTION.W:
                angle = -90;
                break;
            case GAME.DIRECTION.E:
                angle = -30;
                break;
            case GAME.DIRECTION.A:
                angle = 170;
                break;
            case GAME.DIRECTION.S:
                angle = 90;
                break;
            case GAME.DIRECTION.D:
                angle = 30;
                break;
            default:
                angle = 0;
        }

        hexIndices.forEach((index) => {
            const x0 = this.allLabels[index].getCenter().x;
            const y0 = this.allLabels[index].getCenter().y;
            this.scene.tweens.add({
                targets: this.allLabels[index],
                x: x0 + this.currHexRadius * Math.cos((angle * Math.PI) / 180),
                y: y0 + this.currHexRadius * Math.sin((angle * Math.PI) / 180),
                alpha: 0,
                ease: "Sine.easeInExpo",
                duration: 200,
                repeat: 0,
                onComplete: () => {
                    i--;
                    //console.log("Tiles left to move: ", i);
                    this.allLabels[index].setPosition(x0, y0);
                    if (i === 0) this.gameEvents.emit(GAME.EVENT.TILESSHIFTEND);
                },
            });
        });
    }

    public tweenNewTiles(hexIndices: number[]): void {
        hexIndices.forEach((index) => {
            this.scene.tweens.add({
                targets: this.allHexes[index],
                scale: 0.8,
                ease: "Sine.easeInOut",
                duration: 300,
                repeat: 0,
                yoyo: true,
            });
            this.allLabels[index].setAlpha(0.0);
            this.scene.tweens.add({
                targets: this.allLabels[index],
                alpha: 1.0,
                ease: "Sine.easeInExpo",
                duration: 500,
                repeat: 0,
            });
            this.allLabels[index].setScale(0.1);
            this.scene.tweens.add({
                targets: this.allLabels[index],
                scale: 1.0,
                ease: "Sine.easeInExpo",
                duration: 500,
                repeat: 0,
            });
        });
    }

    public changeVideo(key: string): void {
        switch (key) {
            case GAME.UI_KEYS[3]: // change back
                if (!this.videoBacks[this.currVideoNum].isPlaying()) console.log("Curr video is not playing");
                this.videoBacks[this.currVideoNum].setVisible(false).stop();
                if (this.currVideoNum === this.videoBacks.length - 1) this.currVideoNum = 0;
                else this.currVideoNum++;
                this.updateVideoBackPosition();
                this.videoBacks[this.currVideoNum].setVisible(true).play();
                break;
            case GAME.UI_KEYS[4]: // alpha -
                if (this.videoBacks[this.currVideoNum].alpha >= 0.2)
                    this.videoBacks[this.currVideoNum].setAlpha(this.videoBacks[this.currVideoNum].alpha - 0.2);
                break;
            case GAME.UI_KEYS[5]: // alpha +
                if (this.videoBacks[this.currVideoNum].alpha <= 0.8)
                    this.videoBacks[this.currVideoNum].setAlpha(this.videoBacks[this.currVideoNum].alpha + 0.2);
                break;
        }
    }

    private setCoordinates(): void {
        this.prevCenter = this.currCenter;
        this.prevHexRadius = this.currHexRadius;
        const { width, height } = this.scene.scale.gameSize;
        this.currCenter = { x: width / 2, y: height / 2 };
        let radius: number = height > width ? width : height;
        radius = (radius / Math.sqrt(3) / 2) * this.partOfShortSizeUsed;
        this.currHexRadius = radius / GAME.SIZE;
    }

    // private readjustHexes(): void {
    //     console.log(this.currCenter, this.prevCenter);
    //     const shift: Point = {
    //         x: (this.currCenter.x - this.prevCenter.x) / 2,
    //         y: (this.currCenter.y - this.prevCenter.y) / 2,
    //     };
    //     console.log(shift);
    //     this.allHexes.forEach((hex, i) => {
    //         const hexCenter = hex.getCenter();
    //         if (i === 0) console.log(`${i}: ${hexCenter.x},${hexCenter.y}`);
    //         hex.setPosition(hexCenter.x + shift.x, hexCenter.y + shift.y);
    //         if (i === 0) console.log(`${i}: ${hex.getCenter().x},${hex.getCenter().y}`);
    //     });
    // }

    private idleAnimation(idleHexes: HexIdleAnimation[]): void {
        for (let i = 0; i < idleHexes.length; i++) {
            this.scene.tweens.add({
                targets: this.allHexes[idleHexes[i].index],
                alpha: idleHexes[i].alphaLow,
                ease: "Sine.easeInExpo",
                duration: idleHexes[i].duration,
                repeat: 0,
                yoyo: true,
                onComplete: () => {
                    this.runIdleAnimation(false);
                },
            });
        }
    }

    private runIdleAnimation(isFirst: boolean): void {
        const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

        let simHexNumber = 1;
        if (isFirst) simHexNumber = 10;
        const idleHexes: HexIdleAnimation[] = [];
        let idleHex: HexIdleAnimation;
        let alpha: number;

        for (let i = 0; i < simHexNumber; i++) {
            alpha = Math.random();
            alpha = clamp(alpha, 0.8, 1.0);
            idleHex = {
                index: Math.floor(Math.random() * this.allHexes.length),
                alphaLow: alpha < 0.4 ? alpha * 2 : alpha,
                duration: Math.floor(Math.random() * 7000) + 3000,
            };
            //console.log(idleHex.alphaLow);
            idleHexes.push(idleHex);
        }
        this.idleAnimation(idleHexes);
    }

    private showVideoBack(): void {
        let video: Phaser.GameObjects.Video;
        let videoName: string;
        for (let i = 1; i <= 5; i++) {
            videoName = "video_back" + i.toString();
            //console.log(videoName, " - is this video in cache? ", this.scene.game.cache.video.has(videoName));
            video = this.scene.add.video(0, 0, videoName);
            video.setVisible(false).setOrigin(0.5, 0.5).setLoop(true);
            this.add(video);
            this.videoBacks.push(video);
        }

        this.currVideoNum = Math.floor(Math.random() * this.videoBacks.length);

        this.updateVideoBackPosition();

        this.videoBacks[this.currVideoNum].setVisible(true).play();
        //console.log(this.videoBacks[this.currVideoNum].isPlaying(), this.videoBacks[this.currVideoNum].visible);
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

    private updateVideoBackPosition(): void {
        const { width, height } = this.scene.scale.gameSize;
        const wVideo = this.videoBacks[this.currVideoNum].width;
        const hVideo = this.videoBacks[this.currVideoNum].height;
        //console.log(`${width}/${height} - ${wVideo}/${hVideo}`);
        const wScale = width / wVideo;
        const hScale = height / hVideo;
        const biggerScale = wScale > hScale ? wScale : hScale;
        //console.log(`${biggerScale}`);
        //this.currVideoBack.setScale(biggerScale);
        this.videoBacks[this.currVideoNum].setDisplaySize(
            this.videoBacks[this.currVideoNum].width * biggerScale,
            this.videoBacks[this.currVideoNum].height * biggerScale,
        );
        // console.log(
        //     "DisplaySize: ",
        //     this.videoBacks[this.currVideoNum].displayWidth,
        //     this.videoBacks[this.currVideoNum].displayHeight,
        // );
        this.videoBacks[this.currVideoNum].setPosition(this.currCenter.x, this.currCenter.y);
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
