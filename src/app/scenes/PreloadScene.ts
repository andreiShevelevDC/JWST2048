import { assets } from "../../assets/assetsNames/assets";
import { audioAssets } from "../../assets/assetsNames/audio";
import { spines } from "../../assets/assetsNames/spines";
import { spriteSheets } from "../../assets/assetsNames/spriteSheets";
import { SceneNames } from "../enums/Scenes";
import { USE_VIDEO_BACKGROUND } from "../configs/Game";

export default class PreloadScene extends Phaser.Scene {
    public constructor() {
        super({ key: SceneNames.Preload });
    }

    private preload(): void {
        console.log("Starting Asset loading");
        this.loadAssets();
        this.loadSpriteSheets();
        this.loadAudio();
        this.loadSpines();

        if (USE_VIDEO_BACKGROUND) {
            this.load.video("video_back1", "../assets/video_back/52759730.mp4", "loadeddata", false, true);
            this.load.video("video_back2", "../assets/video_back/53033356.mp4", "loadeddata", false, true);
            this.load.video("video_back3", "../assets/video_back/117416121.mp4", "loadeddata", false, true);
            this.load.video("video_back4", "../assets/video_back/117419841.mp4", "loadeddata", false, true);
            this.load.video("video_back5", "../assets/video_back/143679958.mp4", "loadeddata", false, true);
        } else {
            this.load.glsl("marble", "../assets/video_back/marble.glsl");
        }
    }

    private init(): void {
        //
    }

    private create(): void {
        console.log("Asset loading is completed");
        this.scene.start(SceneNames.Main);
    }

    private loadAssets(): void {
        if (assets.length === 0) return;
        assets.forEach((el) => {
            const { name, path } = el;
            this.load.image(name, path);
        });
    }

    private loadSpriteSheets(): void {
        if (spriteSheets.length === 0) return;
        spriteSheets.forEach((el) => {
            this.load.atlas(el, `./assets/spriteSheets/${el}.png`, `./assets/spriteSheets/${el}.json`);
        });
    }

    private loadAudio(): void {
        if (audioAssets.length === 0) return;
        audioAssets.forEach((el) => {
            const { name, path } = el;
            this.load.audio(name, path);
        });
    }

    private loadSpines(): void {
        if (spines.length === 0) return;
        spines.forEach((el) => {
            const { key, atlasURL, jsonURL, preMultipliedAlpha } = el;
            this.load.spine(key, jsonURL, atlasURL, preMultipliedAlpha);
        });
    }
}
