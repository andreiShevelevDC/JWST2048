import * as GAME from "../configs/Game";

type Point = {
    x: number;
    y: number;
};

export default class TouchHandler {
    private scene: Phaser.Scene;
    private gameEvents: Phaser.Events.EventEmitter;
    private pointerDown: Point;

    public constructor(scene: Phaser.Scene, eventEmitter: Phaser.Events.EventEmitter) {
        this.scene = scene;
        this.gameEvents = eventEmitter;
        this.scene.input.on("pointerdown", this.touchStart, this);
        this.scene.input.on("pointerup", this.touchEnd, this);
        //this.scene.input.on("pointermove", this.touchMove);
    }

    // returns direction vector
    private handleSwipe(dX: number, dY: number): void {
        let dir: number[] = [];
        if (Math.abs(dY) > Math.abs(dX)) {
            // vertical swipe
            if (dY > 0) dir = GAME.DIRECTION.S;
            else dir = GAME.DIRECTION.W;
        } else {
            // horiz swipes
            if (dX > 0 && dY > 0) dir = GAME.DIRECTION.D;
            if (dX > 0 && dY < 0) dir = GAME.DIRECTION.E;
            if (dX < 0 && dY < 0) dir = GAME.DIRECTION.Q;
            if (dX < 0 && dY > 0) dir = GAME.DIRECTION.A;
        }
        if (dir.length === 2) this.gameEvents.emit(GAME.EVENT.MOVE, dir);
        //console.log(`SWIPE: ${dX} / ${dY} = ${dir}`);
    }

    private touchStart(pointer: Phaser.Input.Pointer): void {
        this.pointerDown = { x: pointer.x, y: pointer.y };
    }

    private touchEnd(pointerUp: Phaser.Input.Pointer): void {
        //console.log(`MOVE dX: ${pointerUp.x - this.pointerDown.x}, dY: ${pointerUp.y - this.pointerDown.y}`);
        const height = this.scene.scale.gameSize.height;
        if (pointerUp.y > height - GAME.TOUCH_BAR_WIDTH && this.pointerDown.y > height - GAME.TOUCH_BAR_WIDTH)
            this.backVideoControl(pointerUp.x);
        this.handleSwipe(pointerUp.x - this.pointerDown.x, pointerUp.y - this.pointerDown.y);
    }

    // private touchMove(pointer: Phaser.Input.Pointer): void {
    //     console.log(`MOVE dX: ${pointer.upX - pointer.downX}, dY: ${pointer.upY - pointer.downY}`);
    // }

    // MVP & debug
    private backVideoControl(pointerUpX: number): void {
        const width = this.scene.scale.gameSize.width;
        if (pointerUpX < GAME.TOUCH_BAR_WIDTH) this.gameEvents.emit(GAME.EVENT.UI, GAME.UI_KEYS[4]);
        else if (pointerUpX > width - GAME.TOUCH_BAR_WIDTH) this.gameEvents.emit(GAME.EVENT.UI, GAME.UI_KEYS[5]);
        else this.gameEvents.emit(GAME.EVENT.UI, GAME.UI_KEYS[3]);
    }
}
