// pawn = "P", knight = "N", bishop = "B", rook = "R", queen = "Q" and king = "K".
// lowerCase: Black ; upperCase: White.
// A move is [integer, integer].
const START_POS =
    "rnbqkbnr" +
    "pppppppp" +
    "--------" +
    "--------" +
    "--------" +
    "--------" +
    "PPPPPPPP" +
    "RNBQKBNR";
const CHAR_VAL = {
    P: 1,
    N: 3,
    B: 3.5,
    R: 5,
    Q: 9,
    K: 0,
    "-": 0,
    p: -1,
    n: -3,
    b: -3.5,
    r: -5,
    q: -9,
    k: -0, // ;)
};
const white_pieces = "PNBRQK";
const black_pieces = white_pieces.toLowerCase();

module.exports = class ChessGame {
    next_id = 0;
    constructor() {
        this.pos = START_POS;
        this.id = ChessGame.next_id;
        ChessGame.next_id++;
        this.moves_played = [];
        this.white_to_play = true;
        this.direction = 1;
        this.castling = { white: [true, true], black: [true, true] };
    }

    addIfIsEnemy(moves, i, j) {
        let isEnemy = null;
        if (this.white_to_play)
            isEnemy = black_pieces.includes(this.pos.charAt(j));
        else isEnemy = white_pieces.includes(this.pos.charAt(j));
        if (isEnemy) this.addMove(moves, i, j);
        return isEnemy;
    }

    addIfIsEmpty(moves, i, j) {
        let isEmpty = this.pos.charAt(j) == "-";
        if (isEmpty) this.addMove(moves, i, j);
        return isEmpty;
    }

    addMove(moves, i, j) {
        if (j >= 0 && j < 64) moves.append(i, j);
    }

    getAllMoves() {
        let moves = [];
        for (var i = 0; i < this.pos.length; i++) {
            let piece = this.pos.charAt(i);
            let piece_lc = piece.toLowerCase();
            if (
                (piece_lc == piece && this.white_to_play) ||
                (piece_lc != piece && !this.white_to_play)
            )
                continue;
            switch (piece_lc) {
                case p:
                    // Advance on empty cases.
                    this.addIfIsEmpty(moves, i, i + -8 * this.direction);
                    if (i > 7 && i < 16)
                        this.addIfIsEmpty(moves, i, i + -16 * this.direction);
                    // Eat enemy piece.
                    this.addIfIsEnemy(moves, i, i + -7 * this.direction);
                    this.addIfIsEnemy(moves, i, i + -9 * this.direction);
                    // En passant.
                    if (this.moves_played.length == 0) break;
                    let last_move = this.moves_played.slice(-1);
                    if (
                        this.pos.charAt(last_move[1]).toLowerCase() == "p" &&
                        last_move[0] - last_move[1] == -16 * this.direction
                    ) {
                        if (last_move[1] == i - 1)
                            this.addMove(moves, i, i + -9 * this.direction);
                        else if (last_move[1] == i + 1)
                            this.addMove(moves, i, i + -7 * this.direction);
                    }
                    break;
                case n:
                    [-17, -15, -10, -6, 6, 10, 15, 17].forEach((val) => {
                        this.addMove(moves, i, i + val);
                    });
                    break;
                case b:
                    [-9, -7, 7, 9].forEach((val) => {
                        let cases = 1;
                        while (this.addIfIsEmpty(moves, i, i + val * cases)) {
                            cases++;
                        }
                        this.addIfIsEnemy(moves, i, i + val * cases);
                    });
                    break;
                case r:
                    [-8, -1, 1, 8].forEach((val) => {
                        let cases = 1;
                        while (this.addIfIsEmpty(moves, i, i + val * cases)) {
                            cases++;
                        }
                        this.addIfIsEnemy(moves, i, i + val * cases);
                    });
                    break;
                case q:
                    [-9, -8, -7, -1, 1, 7, 8, 9].forEach((val) => {
                        let cases = 1;
                        while (this.addIfIsEmpty(moves, i, i + val * cases)) {
                            cases++;
                        }
                        this.addIfIsEnemy(moves, i, i + val * cases);
                    });
                    break;
                case k:
                    [-9, -8, -7, -1, 1, 7, 8, 9].forEach((val) => {
                        this.addMove(moves, i, i + val);
                    });
                    // Castling.
                    // WIP.
                    break;
                default:
                    break;
            }
        }
        return moves;
    }

    getValidMoves() {
        let allMoves = getAllMoves();
        let validMoves = [];
        allMoves.array.forEach((move) => {
            // Check for specific situations (e.g. checks).
            // WIP.
            validMoves.append(move);
        });
        return validMoves;
    }

    registerMove(move) {
        if (!this.getValidMoves().includes(move)) return false;
        let piece = this.pos.charAt(move[0]);
        // En passant.
        if (piece.toLowerCase() == "p" && this.pos.charAt(move[1]) == "-") {
            if (move[0] - move[1] == -7 * this.direction) {
                this.pos = this.pos.splice(
                    move[0] + 1 * this.direction,
                    1,
                    "-"
                );
            } else if (move[0] - move[1] == -9 * this.direction) {
                this.pos = this.pos.splice(
                    move[0] + -1 * this.direction,
                    1,
                    "-"
                );
            }
        }
        // Castling.
        // WIP.
        this.pos = this.pos.splice(move[0], 1, "-");
        this.pos = this.pos.splice(move[1], 1, piece);
        this.moves_played.append(move);
        this.white_to_play = !this.white_to_play;
        this.direction = -this.direction;
        return true;
    }

    evalPos = function () {
        let val = 0;
        for (var i = 0; i < this.pos.length; i++) {
            val += CHAR_VAL[this.pos.charAt(i)];
        }
        return val;
    };
};
