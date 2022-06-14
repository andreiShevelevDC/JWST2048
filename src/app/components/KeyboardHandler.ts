import * as GAME from "../configs/Game";

export default class KeyboardHandler {
    private keyCode: string;
    private prevKeypressTimestamp = 0;

    //public constructor() {}

    public keyboardHandler(event: KeyboardEvent): { key: number; dir: number[] | string } {
        const currentTimestamp = Date.now();
        if (currentTimestamp - this.prevKeypressTimestamp < GAME.MOVE_KEYPRESS_DELAY)
            return { key: GAME.KEY.UNASSIGNED, dir: "" };

        //console.log(currentTimestamp - this.prevKeypressTimestamp);
        this.prevKeypressTimestamp = currentTimestamp;
        this.keyCode = event.code;

        switch (this.keyCode) {
            case GAME.MOVE_KEYS[0]:
            case GAME.MOVE_KEYS[1]:
                return { key: GAME.KEY.MOVE, dir: GAME.DIRECTION.Q };

            case GAME.MOVE_KEYS[2]:
            case GAME.MOVE_KEYS[3]:
                return { key: GAME.KEY.MOVE, dir: GAME.DIRECTION.W };

            case GAME.MOVE_KEYS[4]:
            case GAME.MOVE_KEYS[5]:
                return { key: GAME.KEY.MOVE, dir: GAME.DIRECTION.E };

            case GAME.MOVE_KEYS[6]:
            case GAME.MOVE_KEYS[7]:
                return { key: GAME.KEY.MOVE, dir: GAME.DIRECTION.A };

            case GAME.MOVE_KEYS[8]:
            case GAME.MOVE_KEYS[9]:
                return { key: GAME.KEY.MOVE, dir: GAME.DIRECTION.S };

            case GAME.MOVE_KEYS[10]:
            case GAME.MOVE_KEYS[11]:
                return { key: GAME.KEY.MOVE, dir: GAME.DIRECTION.D };

            // test popup
            case GAME.UI_KEYS[0]:
            case GAME.UI_KEYS[1]:
            case GAME.UI_KEYS[2]:
            case GAME.UI_KEYS[3]:
            case GAME.UI_KEYS[4]:
            case GAME.UI_KEYS[5]:
                return { key: GAME.KEY.UI, dir: this.keyCode };

            default:
                //console.log("Unhandled key pressed: ", this.keyCode);
                return { key: GAME.KEY.UNASSIGNED, dir: "" };
        }
    }

    private showKeyCode(): void {
        console.log("Pressed key code: ", this.keyCode);
    }

    private getPressedKeyCode(): string {
        return this.keyCode;
    }
}
