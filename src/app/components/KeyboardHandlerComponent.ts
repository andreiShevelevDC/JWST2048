import * as GAME from "../configs/Game";

export default class KeyboardHandler {
    private keyCode: string;
    private prevKeypressTimestamp = 0;

    //public constructor() {}

    public keyboardHandler(event: KeyboardEvent): (number | number[])[] {
        const currentTimestamp = Date.now();
        if (currentTimestamp - this.prevKeypressTimestamp < GAME.MOVE_KEYPRESS_DELAY) return [GAME.KEY.UNASSIGNED];

        //console.log(currentTimestamp - this.prevKeypressTimestamp);
        this.prevKeypressTimestamp = currentTimestamp;
        this.keyCode = event.code;

        switch (this.keyCode) {
            case GAME.MOVE_KEYS[0]:
            case GAME.MOVE_KEYS[1]:
                return [GAME.KEY.MOVE, GAME.DIRECTION.Q];

            case GAME.MOVE_KEYS[2]:
            case GAME.MOVE_KEYS[3]:
                return [GAME.KEY.MOVE, GAME.DIRECTION.W];

            case GAME.MOVE_KEYS[4]:
            case GAME.MOVE_KEYS[5]:
                return [GAME.KEY.MOVE, GAME.DIRECTION.E];

            case GAME.MOVE_KEYS[6]:
            case GAME.MOVE_KEYS[7]:
                return [GAME.KEY.MOVE, GAME.DIRECTION.A];

            case GAME.MOVE_KEYS[8]:
            case GAME.MOVE_KEYS[9]:
                return [GAME.KEY.MOVE, GAME.DIRECTION.S];

            case GAME.MOVE_KEYS[10]:
            case GAME.MOVE_KEYS[11]:
                return [GAME.KEY.MOVE, GAME.DIRECTION.D];

            default:
                //console.log("Unhandled key pressed: ", this.keyCode);
                return [GAME.KEY.UNASSIGNED];
        }
    }

    private showKeyCode(): void {
        console.log("Pressed key code: ", this.keyCode);
    }

    private getPressedKeyCode(): string {
        return this.keyCode;
    }
}
