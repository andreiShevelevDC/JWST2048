import * as GAME from "../configs/Game";
import KeyboardHandler from "../components/KeyboardHandler";
import TouchHandler from "../components/TouchHandler";
import CounterComponent from "../components/CounterComponent";

export class UIView extends Phaser.GameObjects.Container {
    public keyboard: KeyboardHandler;
    private counter: CounterComponent;
    private moveSound: any;
    private gameEvents: Phaser.Events.EventEmitter;

    public constructor(public scene, eventEmitter: Phaser.Events.EventEmitter) {
        super(scene);
        this.gameEvents = eventEmitter;
        this.init();
        new TouchHandler(scene, eventEmitter);
    }

    public updateCounterTween(): void {
        this.counter.updateCounterTween();
    }

    public updateCounter(newValue: number): void {
        this.counter.update(newValue);
    }

    public playMoveSound(): void {
        this.moveSound.play();
    }

    public resetCounter(): void {
        this.counter.reset();
    }

    // used to show end game results
    public hide(): void {
        //console.log(this.counter.getValue());
        this.counter.hide();
    }

    public show(): void {
        this.counter.show();
    }

    public getCounter = (): number => this.counter.getValue();

    public registerInputHandlers(): void {
        document.addEventListener(GAME.KEYBOARD_EVENT, (event) => {
            const keyboard = this.keyboard.keyboardHandler(event);
            switch (keyboard.key) {
                case GAME.KEY.UNASSIGNED:
                    //TODO: show hotkeys help popup
                    break;
                case GAME.KEY.MOVE:
                    this.gameEvents.emit(GAME.EVENT.MOVE, keyboard.dir);
                    break;
                case GAME.KEY.UI:
                    this.gameEvents.emit(GAME.EVENT.UI, keyboard.dir);
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
        this.playBkgMusic();
        this.initMoveSound();
    }

    private initMoveSound(): void {
        this.moveSound = this.scene.sound.add("magic-sound-1.wav", {
            mute: false,
            volume: 0.2,
            rate: 1.0,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 10,
        });
    }

    private playBkgMusic(): void {
        //console.log(this.scene.game.cache.audio.entries);
        const music1 = this.scene.sound.add("essesq_-_With_These_Wings.mp3", {
            mute: false,
            volume: 0.5,
            rate: 0.85,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 2000,
        });
        const music2 = this.scene.sound.add("Light-Years_V001_Looping.mp3", {
            mute: false,
            volume: 0.5,
            rate: 0.85,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 2000,
        });
        const rand = Math.floor(Math.random() * 2);
        switch (rand) {
            case 0:
                music1.play();
                break;
            case 1:
                music2.play();
        }
    }

    private initCounter(): void {
        this.counter = new CounterComponent(this.scene);
        this.add(this.counter);
    }
}
