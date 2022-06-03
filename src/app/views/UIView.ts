//import { CounterComponent } from "../components/CounterComponent";
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
