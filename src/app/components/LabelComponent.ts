export default class LabelComponent extends Phaser.GameObjects.Text {
    public constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        labelStyle: Phaser.Types.GameObjects.Text.TextStyle,
    ) {
        super(scene, x, y, text, labelStyle);
        this.setOrigin(0.5, 0.5).setDepth(2);
        scene.add.existing(this);
    }

    public show(): void {
        this.setVisible(true);
    }

    public hide(): void {
        (this as Phaser.GameObjects.Text).setVisible(false);
    }
}
