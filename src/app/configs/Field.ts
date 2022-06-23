// c - color
// a - alpha
// w - width

export const JWST = {
    cBackground: 0x01020a,
    cHexFill: 0xfccc00,
    cHexFillFrozen: 0x0d8cfc,
    aHexFill: 1.0,
    wLine: 2,
    cLine: 0x333333,
    aLine: 0.2,
};

export const JWST_LABEL: Phaser.Types.GameObjects.Text.TextStyle = {
    //fontFamily: "Georgia",
    //fontSize: "36px",
    font: "36px Georgia",
    //fontStyle: "strong",
    //backgroundColor: JWST.cBackground,
    color: "#3d3200",
    // stroke: ,
    // strokeThickness: ,
    testString: "0123456789",
};

export const JWST_FROZEN_LABEL: Phaser.Types.GameObjects.Text.TextStyle = {
    color: "#0001B0",
};

// export const SIZE = {
//     WIDTH: 0.8,
//     HEIGHT: 0.7,
// };

export const STARS_PALETTE = [0x02377b, 0xf68025, 0xfa9829, 0xffd205, 0xee1652];
