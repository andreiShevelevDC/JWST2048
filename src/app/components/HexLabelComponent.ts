import { JWST_LABEL } from "../configs/Field";
import LabelComponent from "./LabelComponent";

export default class HexLabelComponent extends LabelComponent {
    private fontSizes = [0, 0, 0, 0];

    public constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "", JWST_LABEL);
        this.setOrigin(0.5, 0.5).setDepth(2);
        scene.add.existing(this);
    }

    public setFontSizeOnHexSize(hexRadius: number): void {
        this.fontSizes[0] = Math.floor((hexRadius + 15) / 2);
        for (let i = 1; i < this.fontSizes.length; i++) this.fontSizes[i] = this.fontSizes[i - 1] - 4;
        let currLen = this.text.length;
        if (currLen > 4) currLen = 4;
        if (currLen > 0) this.setFontSize(this.fontSizes[currLen - 1]);
    }

    public setValue(value: number): void {
        const prevTextLength = this.text.length;
        this.setText(value.toString());
        const currTextLength = this.text.length;
        if (currTextLength > 0 && currTextLength !== prevTextLength)
            this.setFontSize(this.fontSizes[currTextLength - 1]);
    }
}
