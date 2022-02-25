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
        this._valid_moves = [];
    }

    addIfIsEnemy(moves, i, j, check_proxi = true) {
        let isEnemy = null;
        if (this.white_to_play)
            isEnemy = black_pieces.includes(this.pos.charAt(j));
        else isEnemy = white_pieces.includes(this.pos.charAt(j));
        if (isEnemy) this.addMove(moves, i, j, check_proxi);
        return isEnemy;
    }

    addIfIsEmpty(moves, i, j, check_proxi = true) {
        let isEmpty = this.pos.charAt(j) == "-";
        if (isEmpty) this.addMove(moves, i, j, check_proxi);
        return isEmpty;
    }

    addMove(moves, i, j, check_proxi = true) {
        if (this.white_to_play && white_pieces.includes(this.pos.charAt(j)))
            return;
        else if (
            !this.white_to_play &&
            black_pieces.includes(this.pos.charAt(j))
        )
            return;
        if (check_proxi) {
            let cur_cell = [~~(i / 8), i % 8];
            let new_cell = [~~(j / 8), j % 8];
            let proximity = false;
            let found = false;
            moves.forEach((move) => {
                if (move[0] != i) return;
                let prev_cell = [~~(move[1] / 8), move[1] % 8];
                if (
                    Math.abs(cur_cell[0] - new_cell[0]) <= 1 &&
                    Math.abs(cur_cell[1] - new_cell[1]) <= 1
                )
                    proximity = true;
                if (
                    Math.abs(prev_cell[0] - new_cell[0]) <= 1 &&
                    Math.abs(prev_cell[1] - new_cell[1]) <= 1
                )
                    proximity = true;
                found = true;
            });
            if (!proximity && found) return;
        }
        if (j >= 0 && j < 64) moves.push([i, j]);
    }

    getAllMoves() {
        let moves = [];
        for (var i = 0; i < this.pos.length; i++) {
            let piece = this.pos.charAt(i);
            if (piece == "-") continue;
            let piece_lc = piece.toLowerCase();
            if (
                (piece_lc == piece && this.white_to_play) ||
                (piece_lc != piece && !this.white_to_play)
            )
                continue;
            switch (piece_lc) {
                case "p":
                    // Advance on empty cases.
                    this.addIfIsEmpty(moves, i, i + -8 * this.direction);
                    if (
                        ((this.white_to_play && i > 47 && i < 56) ||
                            (!this.white_to_play && i > 7 && i < 16)) &&
                        this.pos.charAt(i + -8 * this.direction) == "-"
                    )
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
                case "n":
                    let cur_cell = [~~(i / 8), i % 8];
                    [-17, -15, -10, -6, 6, 10, 15, 17].forEach((val) => {
                        let new_cell = [~~((i + val) / 8), (i + val) % 8];
                        if (
                            Math.abs(new_cell[0] - cur_cell[0]) +
                                Math.abs(new_cell[1] - cur_cell[1]) ==
                            3
                        )
                            this.addMove(moves, i, i + val, false);
                    });
                    break;
                case "b":
                    [-9, -7, 7, 9].forEach((val) => {
                        let cases = 1;
                        let prev = i % 8;
                        while (
                            [-1, 1].includes(prev - ((i + val * cases) % 8)) &&
                            this.addIfIsEmpty(moves, i, i + val * cases)
                        ) {
                            prev = (i + val * cases) % 8;
                            cases++;
                        }
                        if ([-1, 1].includes(prev - ((i + val * cases) % 8)))
                            this.addIfIsEnemy(moves, i, i + val * cases);
                    });
                    break;
                case "r":
                    [-8, -1, 1, 8].forEach((val) => {
                        let cases = 1;
                        let prev = i % 8;
                        while (
                            ([-1, 1].includes(prev - ((i + val * cases) % 8)) ||
                                Math.abs(val) == 8) &&
                            this.addIfIsEmpty(moves, i, i + val * cases)
                        ) {
                            prev = (i + val * cases) % 8;
                            cases++;
                        }
                        if (
                            [-1, 1].includes(prev - ((i + val * cases) % 8)) ||
                            Math.abs(val) == 8
                        )
                            this.addIfIsEnemy(moves, i, i + val * cases);
                    });
                    break;
                case "q":
                    [-9, -8, -7, -1, 1, 7, 8, 9].forEach((val) => {
                        let cases = 1;
                        let prev = i % 8;
                        while (
                            ([-1, 1].includes(prev - ((i + val * cases) % 8)) ||
                                Math.abs(val) == 8) &&
                            this.addIfIsEmpty(moves, i, i + val * cases)
                        ) {
                            prev = (i + val * cases) % 8;
                            cases++;
                        }
                        if (
                            [-1, 1].includes(prev - ((i + val * cases) % 8)) ||
                            Math.abs(val) == 8
                        )
                            this.addIfIsEnemy(moves, i, i + val * cases);
                    });
                    break;
                case "k":
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
        if (this._valid_moves.length > 0) return this._valid_moves;
        let allMoves = this.getAllMoves();
        let validMoves = [];
        allMoves.forEach((move) => {
            // Check for specific situations (e.g. checks).
            // WIP.
            validMoves.push(move);
        });
        this._valid_moves = validMoves;
        return validMoves;
    }

    registerMove(move) {
        function replaceAt(str, index, replacement) {
            let out = "";
            for (var i = 0; i < str.length; i++) {
                if (i == index) out += replacement;
                else out += str.charAt(i);
            }
            return out;
        }

        let v_moves = this.getValidMoves();
        let isValid = false;
        v_moves.forEach((val) => {
            if (val[0] == move[0] && val[1] == move[1]) isValid = true;
        });
        if (!isValid) return false;
        let piece = this.pos.charAt(move[0]);
        // En passant.
        if (piece.toLowerCase() == "p" && this.pos.charAt(move[1]) == "-") {
            if (move[0] - move[1] == -7 * this.direction) {
                this.pos = replaceAt(
                    this.pos,
                    move[0] + 1 * this.direction,
                    "-"
                );
            } else if (move[0] - move[1] == -9 * this.direction) {
                this.pos = replaceAt(
                    this.pos,
                    move[0] + -1 * this.direction,
                    "-"
                );
            }
        }
        // Castling.
        // WIP.
        this.pos = replaceAt(this.pos, move[0], "-");
        this.pos = replaceAt(this.pos, move[1], piece);
        this.moves_played.push(move);
        this.white_to_play = !this.white_to_play;
        this.direction = -this.direction;
        this._valid_moves = [];
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
