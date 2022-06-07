//import { CounterComponent } from "../components/CounterComponent";
import * as GAME from "../configs/Game";
import KeyboardHandler from "../components/KeyboardHandler";

export class UIView extends Phaser.GameObjects.Container {
    public keyboard: KeyboardHandler;
    //private counter: CounterComponent;

    public constructor(public scene) {
        super(scene);
        this.init();
    }

    // public updateCounter(): void {
    //     this.counter.updateRounds();
    // }

    public registerInputHandlers(gameEvents: Phaser.Events.EventEmitter): void {
        document.addEventListener(GAME.KEYBOARD_EVENT, (event) => {
            const keyboard = this.keyboard.keyboardHandler(event);
            switch (keyboard.key) {
                case GAME.KEY.UNASSIGNED:
                    //TODO: show hotkeys help popup
                    break;
                case GAME.KEY.MOVE:
                    gameEvents.emit("eventMove", keyboard.dir);
                    break;
                case GAME.KEY.UI:
                    // UI action
                    break;
            }
        });
    }

    private init(): void {
        //this.initCounter();
        this.keyboard = new KeyboardHandler();
    }

    // private initCounter(): void {
    //     this.counter = new CounterComponent(this.scene);
    //     this.counter.setPosition(300, 100);
    //     this.add(this.counter);
    // }
}
