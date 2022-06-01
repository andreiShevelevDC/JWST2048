import { JWST_LABEL } from "../configs/FieldVisuals";

export class LabelComponent extends Phaser.GameObjects.Text {
    public constructor(
        scene: Phaser.Scene,
        x = 0,
        y = 0,
        text: string,
        //style: Phaser.Types.GameObjects.Text.TextStyle,
    ) {
        super(scene, x, y, text, JWST_LABEL);
        this.setOrigin(0.5, 0.5); //.setPosition(x, y);
        scene.add.existing(this);
    }

    public show(): void {
        this.setVisible(true);
    }

    public hide(): void {
        (this as Phaser.GameObjects.Text).setVisible(false);
    }
}
