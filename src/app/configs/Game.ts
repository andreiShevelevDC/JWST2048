export const SIZE = 3; // central hex + 2 rings = 19 cells

export const CELL_EMPTY = 0;
export const CELL_DISABLED = -1; // for field configurations with gaps or out of borders
export const BASE_TILE = 2;

export enum STATE {
    PAUSE,
    PLAYING,
}

export enum EVENT {
    MOVE = "eventMove",
    SCOREUPDATE = "eventScoreUpdate",
    UI = "eventUI",
}

export const NEW_TILES = [BASE_TILE, BASE_TILE, BASE_TILE, BASE_TILE, BASE_TILE ** 2, BASE_TILE ** 2];

// a value to make to win the game
export const GOAL = BASE_TILE ** 10;

// direction vectors
export const DIRECTION = {
    Q: [-1, 1],
    W: [0, 1],
    E: [1, 0],
    A: [-1, 0],
    S: [0, -1],
    D: [1, -1],
};

export const MOVE_KEYPRESS_DELAY = 200; // ms
export enum KEY {
    UNASSIGNED,
    MOVE,
    UI,
}
export const KEYBOARD_EVENT = "keyup";
// key codes that make move
export const MOVE_KEYS = [
    "KeyQ",
    "Numpad7",
    "KeyW",
    "Numpad8",
    "KeyE",
    "Numpad9",
    "KeyA",
    "Numpad4",
    "KeyS",
    "Numpad5",
    "KeyD",
    "Numpad6",
];
