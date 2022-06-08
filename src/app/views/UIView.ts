import * as GAME from "../configs/Game";
import KeyboardHandler from "../components/KeyboardHandler";
import CounterComponent from "../components/CounterComponent";

export class UIView extends Phaser.GameObjects.Container {
    public keyboard: KeyboardHandler;
    private counter: CounterComponent;

    public constructor(public scene) {
        super(scene);
        this.init();
    }

    public updateCounter(newValue: number): void {
        this.counter.update(newValue);
    }

    // TODO: output end game popup
    public showResults(): void {
        console.log(this.counter.getValue());
    }

    public registerInputHandlers(gameEvents: Phaser.Events.EventEmitter): void {
        document.addEventListener(GAME.KEYBOARD_EVENT, (event) => {
            const keyboard = this.keyboard.keyboardHandler(event);
            switch (keyboard.key) {
                case GAME.KEY.UNASSIGNED:
                    //TODO: show hotkeys help popup
                    break;
                case GAME.KEY.MOVE:
                    gameEvents.emit(GAME.EVENT.MOVE, keyboard.dir);
                    break;
                case GAME.KEY.UI:
                    // UI action
                    break;
            }
        });
    }

    public updatePosition(): void {
        this.counter.updatePosition();
    }

    private init(): void {
        this.keyboard = new KeyboardHandler();
        this.initCounter();
    }

    private initCounter(): void {
        this.counter = new CounterComponent(this.scene);
        this.add(this.counter);
    }
}
