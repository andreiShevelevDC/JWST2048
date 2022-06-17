export const SCORE_LABEL_POS_X = -100; // from the right
export const SCORE_LABEL_POS_Y = 50; // from the top

export const SCORE_LABEL: Phaser.Types.GameObjects.Text.TextStyle = {
    font: "20px Georgia",
    //fontStyle: "strong",
    color: "#fccc00",
    // stroke: ,
    // strokeThickness: ,
    testString: "0123456789",
};

export const SCORE_BACK_SIZE_X = 130;
export const SCORE_BACK_SIZE_Y = 40;

// TODO: move SCORE_BACK_SIZE_X & Y inside SCORE_BACK
export const SCORE_BACK = {
    cFill: 0x000000,
    aFill: 0.4,
    wStroke: 2,
    cStroke: 0xfccc00,
    aStroke: 1.0,
};

export const ENDGAME_POPUP_BACK = {
    sizeX: 250,
    sizeY: 150,
    cFill: 0x000000,
    aFill: 0.75,
    wStroke: 2,
    cStroke: 0xfccc00,
    aStroke: 1.0,
};

export const ENDGAME_POPUP_BUTTON = {
    sizeX: 110,
    sizeY: 35,
    cFill: 0xfccc00,
    aFill: 1.0,
    wStroke: 0,
    cStroke: 0x000000,
    aStroke: 0.0,
    cFillActive: 0x7d6600,
    aFillActive: 1.0,
    wStrokeActive: 1,
    cStrokeActive: 0xfccc00,
    aStrokeActive: 0.5,
};

export const ENDGAME_POPUP_BUTTON_LABEL = {
    font: "18px Georgia",
    color: "#000000",
};

export const ENDGAME_POPUP_BUTTON_LABEL_ACTIVE = {
    font: "21px Georgia",
    color: "#fccc00",
};
