export const SIZE = 3; // central hex + 2 rings = 19 cells
export const USE_VIDEO_BACKGROUND = true; // instead of particles & shader

export const CELL_EMPTY = 0;
export const CELL_DISABLED = -1; // for field configurations with gaps or out of borders
export const BASE_TILE = 2;

export enum STATE {
    ABSENT, // finished or not started, no input allowed
    PAUSE, // paused for animation or showing menu, no input allowed
    WAIT, // waiting for input
}

// for saving shifted pairs
export interface ShiftedPair {
    start: number;
    finish: number;
}

export interface MoveResults {
    shifted: ShiftedPair[]; // pairs of indices
    merged: number[]; // merged tiles indices
    mergedScore: number;
}

export enum EVENT {
    MOVE = "eventMove",
    RESTART = "eventGameRestart",
    UI = "eventUI",
    MOVEEND = "eventMoveEnd",
    SHOWRESULTS = "eventShowResults",
    FREEZEFINISHED = "eventFreezeFinished",
}

export const NEW_TILES = [BASE_TILE, BASE_TILE, BASE_TILE, BASE_TILE, BASE_TILE ** 2];

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

export const UI_KEYS = [
    "KeyF", // show end game popup without stopping the game
    "KeyL", // lose game
    "KeyV", // Win game
    "ArrowUp", // next video back
    "ArrowLeft", // less video back alpha
    "ArrowRight", // more video back alpha
];

export const TOUCH_BAR_WIDTH = 100;

export enum ELEMENTSDEPTH {
    //FILLBACK,
    //VIDEO,
    SHADERBACK,
    STILLSTARS,
    MOVINGSTARS,
    FIELD,
}
