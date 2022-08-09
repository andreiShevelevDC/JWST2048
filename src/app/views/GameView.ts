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
    private idleTweens: Phaser.Tweens.TweenManager;
    private movingStars: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private stillStars: Phaser.GameObjects.Particles.ParticleEmitterManager;

    public constructor(scene: Phaser.Scene, eventsEmitter: Phaser.Events.EventEmitter) {
        super(scene);
        this.gameEvents = eventsEmitter;
        this.idleTweens = new Phaser.Tweens.TweenManager(scene);
        this.setCoordinates();
        if (GAME.USE_VIDEO_BACKGROUND) {
            this.showVideoBack();
            this.updateVideoBackPosition();
        } else {
            this.showShader();
            this.createStars();
        }
        this.draw();
        this.runIdleAnimation(true);
        //this.updateStars();
    }

    public reset(): void {
        this.allLabels.forEach((label) => label.setText("").setScale(1.0).setStyle({ color: THEME.JWST_LABEL.color }));
        this.allHexes.forEach((hex) => hex.setScale(1.0).setFillStyle(THEME.JWST.cHexFill, THEME.JWST.aHexFill));
        console.log(this.idleTweens.getAllTweens());
    }

    public showMoveResult(result: GAME.MoveResults, values: number[]): void {
        this.tweenShiftedTiles(result, values);
    }

    public updatePosition(): void {
        this.setCoordinates();
        if (GAME.USE_VIDEO_BACKGROUND) this.updateVideoBackPosition();
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

    public tweenLoseGame(): void {
        this.scene.tweens.add({
            targets: this.allHexes,
            alpha: 0.0,
            scale: 0.0,
            ease: "Expo.easeIn",
            duration: 1500,
            repeat: 0,
            onComplete: () => {
                this.gameEvents.emit(GAME.EVENT.SHOWRESULTS);
            },
        });
        this.scene.tweens.add({
            targets: this.allLabels,
            alpha: 0.0,
            scale: 0.2,
            ease: "Expo.easeIn",
            duration: 1000,
            repeat: 0,
        });
    }

    public tweenWinGame(): void {
        this.scene.tweens.add({
            targets: this.allHexes,
            alpha: 0.8,
            scale: 20,
            ease: "Expo.easeIn",
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
            ease: "Expo.easeIn",
            duration: 1000,
            repeat: 0,
        });
    }

    public tweenThawAndFreeze(input: { thawed: number[]; frozen: number[] }): void {
        const thawTilesTL = this.scene.tweens.createTimeline({
            onComplete: () => this.tweenFreeze(input.frozen),
        });
        input.thawed.forEach((cellIndex) => {
            thawTilesTL.add({
                targets: this.allHexes[cellIndex],
                fillColor: THEME.JWST.cHexFill,
                scale: 1.0,
                ease: "Sine.easeInOut",
                duration: 300,
                repeat: 0,
                offset: 0,
                onComplete: () => this.allLabels[cellIndex].setStyle({ color: THEME.JWST_LABEL.color }),
            });
        });
        thawTilesTL.play();
    }

    public newTiles(hexIndices: number[], fieldValues: number[]): void {
        const showNewTilesTL = this.scene.tweens.createTimeline({
            onComplete: () => this.updateLabelsData(fieldValues),
        });
        hexIndices.forEach((index) => {
            showNewTilesTL.add({
                targets: this.allHexes[index],
                scale: 0.8,
                ease: "Sine.easeInOut",
                duration: 300,
                repeat: 0,
                yoyo: true,
                offset: 0,
            });
            this.allLabels[index].setAlpha(0.0);
            showNewTilesTL.add({
                targets: this.allLabels[index],
                alpha: 1.0,
                ease: "Expo.easeIn",
                duration: 500,
                repeat: 0,
                offset: 0,
            });
            this.allLabels[index].setScale(0.1);
            showNewTilesTL.add({
                targets: this.allLabels[index],
                scale: 1.0,
                ease: "Expo.easeIn",
                duration: 500,
                repeat: 0,
                offset: 0,
            });
        });
        showNewTilesTL.play();
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

    private createStars(): void {
        const windowShape = new Phaser.Geom.Rectangle(
            -this.currCenter.x,
            -this.currCenter.y,
            2 * this.currCenter.x,
            2 * this.currCenter.y,
        );
        this.stillStars = this.scene.add.particles("particle");
        this.stillStars.setDepth(GAME.ELEMENTSDEPTH.STILLSTARS);
        this.add(this.stillStars);
        this.stillStars.createEmitter({
            //const stillStars = new Phaser.GameObjects.Particles.ParticleEmitter(partMan, {
            frame: "diamond_star.png",
            x: this.currCenter.x,
            y: this.currCenter.y,
            //follow: null,
            speed: { min: 0, max: 3 },
            lifespan: { min: 25000, max: 80000 },
            scale: { start: 1.3, end: 0.1 },
            alpha: { start: 1, end: 0.1 },
            blendMode: Phaser.BlendModes.HUE,
            quantity: 1,
            frequency: 2000,
            tint: THEME.STARS_PALETTE,
            on: true,
            emitZone: {
                type: "random",
                source: windowShape as Phaser.Types.GameObjects.Particles.RandomZoneSource,
            },
            // emitCallback: (particle) => {
            //     particle.rotation = 45;
            //     console.log(particle);
            // },
        });
        //const movingStarsShape = new Phaser.Geom.Rectangle(0, 0, 2 * this.currCenter.x, 2 * this.currCenter.y);
        this.movingStars = this.scene.add.particles("particle");
        this.movingStars.setDepth(GAME.ELEMENTSDEPTH.MOVINGSTARS);
        this.add(this.movingStars);
        this.movingStars.createEmitter({
            frame: "round_star.png",
            x: this.currCenter.x,
            y: this.currCenter.y,
            //follow: null,
            speedX: { min: -120, max: 120 },
            speedY: { min: -250, max: 250 },
            lifespan: { min: 10000, max: 14000 },
            scale: { start: 0.2, end: 0.8 },
            alpha: { start: 0.4, end: 1 },
            blendMode: Phaser.BlendModes.ADD,
            quantity: { min: 3, max: 10 },
            frequency: 250,
            tint: THEME.STARS_PALETTE,
            on: true,
            // bounds: movingStarsShape,
            // bounce: 0,
            // collideBottom: false,
            // collideTop: false,
            // collideLeft: false,
            // collideRight: false,
            //emitCallback: (speed) => console.log(speed),
        });
        //this.stillStars.addListener("onEmit", () => console.log("STAR"));
        //this.stillStars.emitParticle(6);
        //this.movingStars.emitParticle(3);
    }

    private showShader(): void {
        this.scene.add.shader(
            "marble",
            this.currCenter.x,
            this.currCenter.y,
            this.currCenter.x * 2,
            this.currCenter.y * 2,
        );
    }

    // private updateStars(): void {
    //     this.scene.time.addEvent({
    //         delay: 200, // ms
    //         callback: () => this.movingStars.emitParticle(2),
    //         callbackScope: this,
    //         //repeat: 4,
    //         loop: true,
    //         paused: false,
    //     });
    //     this.scene.time.addEvent({
    //         delay: 1300, // ms
    //         callback: () => this.stillStars.emitParticle(1),
    //         callbackScope: this,
    //         //repeat: 4,
    //         loop: true,
    //         paused: false,
    //     });
    // }

    private tweenFreeze(freeze: number[]): void {
        const freezeTilesTL = this.scene.tweens.createTimeline({
            onComplete: () => this.gameEvents.emit(GAME.EVENT.FREEZEFINISHED),
        });
        freeze.forEach((cellIndex) => {
            freezeTilesTL.add({
                targets: this.allHexes[cellIndex],
                fillColor: THEME.JWST.cHexFillFrozen,
                scale: 0.95,
                ease: "Sine.easeInOut",
                duration: 300,
                repeat: 0,
                offset: 0,
                onComplete: () => this.allLabels[cellIndex].setStyle({ color: THEME.JWST_FROZEN_LABEL.color }),
            });
        });
        freezeTilesTL.play();
    }

    private tweenMergedTiles(mergedTilesIndices: number[]): void {
        const showMergedTilesTL = this.scene.tweens.createTimeline({
            onComplete: () => {
                this.gameEvents.emit(GAME.EVENT.MOVEEND);
            },
        });
        mergedTilesIndices.forEach((index) => {
            showMergedTilesTL.add({
                targets: this.allHexes[index],
                scale: 1.2,
                ease: "Sine.easeInOut",
                duration: 300,
                repeat: 0,
                yoyo: true,
                offset: 0,
            });
            this.allLabels[index].setStyle({ color: "#ff0000" });
            showMergedTilesTL.add({
                targets: this.allLabels[index],
                scale: 1.7,
                ease: "Expo.easeIn",
                duration: 300,
                repeat: 0,
                yoyo: true,
                offset: 0,
                onComplete: () => this.allLabels[index].setStyle({ color: THEME.JWST_LABEL.color }),
            });
        });
        showMergedTilesTL.play();
    }

    private tweenShiftedTiles(result: GAME.MoveResults, fieldValues: number[]): void {
        const showShiftedTilesTL = this.scene.tweens.createTimeline({
            onComplete: () => {
                this.updateLabelsData(fieldValues);
                this.tweenMergedTiles(result.merged);
            },
        });
        result.shifted.forEach((pair) => {
            const x0 = this.allLabels[pair.start].getCenter().x;
            const y0 = this.allLabels[pair.start].getCenter().y;
            const x1 = this.allLabels[pair.finish].getCenter().x;
            const y1 = this.allLabels[pair.finish].getCenter().y;
            showShiftedTilesTL.add({
                targets: this.allLabels[pair.start],
                x: { from: x0, to: x1 },
                y: { from: y0, to: y1 },
                alpha: 0,
                ease: "Quad.easeIn",
                duration: 300,
                repeat: 0,
                offset: 0,
                onComplete: () => this.allLabels[pair.start].setPosition(x0, y0),
            });
        });
        showShiftedTilesTL.play();
    }

    // should receive array of strings with new labels' values
    private updateLabelsData(values: number[]): void {
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

    private setCoordinates(): void {
        this.prevCenter = this.currCenter;
        this.prevHexRadius = this.currHexRadius;
        const { width, height } = this.scene.scale.gameSize;
        this.currCenter = { x: width / 2, y: height / 2 };
        let radius: number = height > width ? width : height;
        radius = (radius / Math.sqrt(3) / 2) * this.partOfShortSizeUsed;
        this.currHexRadius = radius / GAME.SIZE;
    }

    private idleAnimation(idleHexes: HexIdleAnimation[]): void {
        for (let i = 0; i < idleHexes.length; i++) {
            const idleTween = this.scene.tweens.add({
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
            this.idleTweens.existing(idleTween);
        }
        // console.log(this.idleTweens.getAllTweens());
    }

    private runIdleAnimation(isFirst: boolean): void {
        const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

        let simHexNumber = 1;
        if (isFirst) simHexNumber = 8;
        const idleHexes: HexIdleAnimation[] = [];
        let idleHex: HexIdleAnimation;
        let alpha: number;

        for (let i = 0; i < simHexNumber; i++) {
            alpha = Math.random();
            alpha = clamp(alpha, 0.8, 1.0);
            idleHex = {
                index: Math.floor(Math.random() * (this.allHexes.length - 1)) + 1, // excludes 0 hex to hide moving stars' emitter point
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
        hex.setOrigin(0, 0).setDepth(GAME.ELEMENTSDEPTH.FIELD);
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
