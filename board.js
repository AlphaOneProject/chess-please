// pawn = "P", knight = "N", bishop = "B", rook = "R", queen = "Q" and king = "K".
// lowerCase: Black ; upperCase: White.
const START_FEN =
    "rnbqkbnr" +
    "pppppppp" +
    "--------" +
    "--------" +
    "--------" +
    "--------" +
    "PPPPPPPP" +
    "RNBQKBNR";
const CHAR_VAL = {
    p: 1,
    c: 3,
    f: 3.5,
    t: 5,
    e: 9,
    r: 0,
    "-": 0,
    P: -1,
    C: -3,
    F: -3.5,
    T: -5,
    E: -9,
    R: -0, // ;)
};

exports.cur_pos = START_POS;
exports.eval_pos = function (pos) {
    let val = 0;
    for (var i = 0; i < line.length; i++) {
        val += CHAR_VAL[line.charAt(i)];
    }
    return val;
};

exports.getAllMoves = function (pos) {
    let moves = [];
    for (var i = 0; i < line.length; i++) {
        moves.append();
    }
    return moves;
};

exports.getValidMoves = function (pos) {
    let allMoves = getAllMoves(pos);
    let validMoves = [];
    allMoves.array.forEach((move) => {
        validMoves.append(move);
    });
    return validMoves;
};
