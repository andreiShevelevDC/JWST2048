// import { IocContext } from "power-di";
// import { PopupServiceEvents } from "../enums/PopupServiceEvents";
// import { PopupService } from "../services/PopupService";
import DrawField from "../components/DrawField";

export class GameView extends Phaser.GameObjects.Container {
    //private bkg: Phaser.GameObjects.Sprite;
    //private racoon: SpineGameObject;
    //private popupService: PopupService;
    public field: DrawField;

    public constructor(public scene) {
        super(scene);
        this.init();
    }

    private init(): void {
        //this.initBkg();
        // this.initSpine();
        // this.initServices();
        this.initField();
    }

    private initField(): void {
        this.field = new DrawField(this.scene);
        this.scene.scale.on("resize", () => this.field.draw());
    }

    // private initBkg(): void {
    //     const { width, height } = this.scene.scale.gameSize;
    //     this.bkg = this.scene.add.sprite(width / 2, height / 2, "bkg.jpg");
    // }
    //
    // private initSpine(): void {
    //     this.racoon = this.scene.add.spine(400, 1020, "racoon");
    //     this.racoon.setScale(0.4);
    //     this.racoon.play("Idle", true);
    //     this.racoon.state.data.setMix("Idle", "Running", 1);
    //     this.racoon.state.data.setMix("Running", "Idle", 1);
    //     this.runRacoon();
    // }
    //
    // private initServices(): void {
    //     this.popupService = IocContext.DefaultInstance.get(PopupService);
    //     this.popupService.event$.on(PopupServiceEvents.RunRacoon, this.runRacoon, this);
    // }
}
