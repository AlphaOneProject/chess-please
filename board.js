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
    constructor() {
        this.pos = START_POS;
        this.moves_played = [];
        this.white_to_play = true;
        this.direction = 1;
        this.castling = [
            [true, true],
            [true, true],
        ];
        this._valid_moves = [];
    }

    copy() {
        let copy = new ChessGame();
        copy.pos = this.pos;
        copy.moves_played = Object.assign([], this.moves_played);
        copy.white_to_play = this.white_to_play;
        copy.direction = this.direction;
        copy.castling = [
            Object.assign([], this.castling[0]),
            Object.assign([], this.castling[1]),
        ];
        copy._valid_moves = Object.assign([], this._valid_moves);
        return copy;
    }

    addIfIsEnemy(game_pos = this.pos, moves, i, j, check_proxi = true) {
        let isEnemy = null;
        if (this.white_to_play)
            isEnemy = black_pieces.includes(game_pos.charAt(j));
        else isEnemy = white_pieces.includes(game_pos.charAt(j));
        if (isEnemy) this.addMove(game_pos, moves, i, j, check_proxi);
        return isEnemy;
    }

    addIfIsEmpty(game_pos = this.pos, moves, i, j, check_proxi = true) {
        let isEmpty = game_pos.charAt(j) == "-";
        if (isEmpty) this.addMove(game_pos, moves, i, j, check_proxi);
        return isEmpty;
    }

    addMove(game_pos = this.pos, moves, i, j, check_proxi = true) {
        if (this.white_to_play && white_pieces.includes(game_pos.charAt(j)))
            return;
        else if (
            !this.white_to_play &&
            black_pieces.includes(game_pos.charAt(j))
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

    getAllMoves(game_pos = this.pos) {
        let moves = [];
        let cur_cell;
        let new_cell;
        for (var i = 0; i < game_pos.length; i++) {
            let piece = game_pos.charAt(i);
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
                    this.addIfIsEmpty(
                        game_pos,
                        moves,
                        i,
                        i + -8 * this.direction
                    );
                    if (
                        ((this.white_to_play && i > 47 && i < 56) ||
                            (!this.white_to_play && i > 7 && i < 16)) &&
                        game_pos.charAt(i + -8 * this.direction) == "-"
                    )
                        this.addIfIsEmpty(
                            game_pos,
                            moves,
                            i,
                            i + -16 * this.direction
                        );
                    // Eat enemy piece.
                    this.addIfIsEnemy(
                        game_pos,
                        moves,
                        i,
                        i + -7 * this.direction
                    );
                    this.addIfIsEnemy(
                        game_pos,
                        moves,
                        i,
                        i + -9 * this.direction
                    );
                    // En passant.
                    if (this.moves_played.length == 0) break;
                    let last_move = this.moves_played.slice(-1)[0];
                    if (
                        game_pos.charAt(last_move[1]).toLowerCase() == "p" &&
                        last_move[0] - last_move[1] == -16 * this.direction
                    ) {
                        if (last_move[1] == i - this.direction) {
                            this.addMove(
                                game_pos,
                                moves,
                                i,
                                i + -9 * this.direction
                            );
                        } else if (last_move[1] == i + this.direction) {
                            this.addMove(
                                game_pos,
                                moves,
                                i,
                                i + -7 * this.direction
                            );
                        }
                    }
                    break;
                case "n":
                    cur_cell = [~~(i / 8), i % 8];
                    [-17, -15, -10, -6, 6, 10, 15, 17].forEach((val) => {
                        new_cell = [~~((i + val) / 8), (i + val) % 8];
                        if (
                            Math.abs(new_cell[0] - cur_cell[0]) +
                                Math.abs(new_cell[1] - cur_cell[1]) ==
                            3
                        )
                            this.addMove(game_pos, moves, i, i + val, false);
                    });
                    break;
                case "b":
                    [-9, -7, 7, 9].forEach((val) => {
                        let cases = 1;
                        let prev = i % 8;
                        while (
                            [-1, 1].includes(prev - ((i + val * cases) % 8)) &&
                            this.addIfIsEmpty(
                                game_pos,
                                moves,
                                i,
                                i + val * cases
                            )
                        ) {
                            prev = (i + val * cases) % 8;
                            cases++;
                        }
                        if ([-1, 1].includes(prev - ((i + val * cases) % 8)))
                            this.addIfIsEnemy(
                                game_pos,
                                moves,
                                i,
                                i + val * cases
                            );
                    });
                    break;
                case "r":
                    [-8, -1, 1, 8].forEach((val) => {
                        let cases = 1;
                        let prev = i % 8;
                        while (
                            ([-1, 1].includes(prev - ((i + val * cases) % 8)) ||
                                Math.abs(val) == 8) &&
                            this.addIfIsEmpty(
                                game_pos,
                                moves,
                                i,
                                i + val * cases
                            )
                        ) {
                            prev = (i + val * cases) % 8;
                            cases++;
                        }
                        if (
                            [-1, 1].includes(prev - ((i + val * cases) % 8)) ||
                            Math.abs(val) == 8
                        )
                            this.addIfIsEnemy(
                                game_pos,
                                moves,
                                i,
                                i + val * cases
                            );
                    });
                    break;
                case "q":
                    [-9, -8, -7, -1, 1, 7, 8, 9].forEach((val) => {
                        let cases = 1;
                        let prev = i % 8;
                        while (
                            ([-1, 1].includes(prev - ((i + val * cases) % 8)) ||
                                Math.abs(val) == 8) &&
                            this.addIfIsEmpty(
                                game_pos,
                                moves,
                                i,
                                i + val * cases
                            )
                        ) {
                            prev = (i + val * cases) % 8;
                            cases++;
                        }
                        if (
                            [-1, 1].includes(prev - ((i + val * cases) % 8)) ||
                            Math.abs(val) == 8
                        )
                            this.addIfIsEnemy(
                                game_pos,
                                moves,
                                i,
                                i + val * cases
                            );
                    });
                    break;
                case "k":
                    cur_cell = [~~(i / 8), i % 8];
                    [-9, -8, -7, -1, 1, 7, 8, 9].forEach((val) => {
                        new_cell = [~~((i + val) / 8), (i + val) % 8];
                        if (
                            Math.abs(cur_cell[0] - new_cell[0]) +
                                Math.abs(cur_cell[1] - new_cell[1]) <=
                            2
                        )
                            this.addMove(game_pos, moves, i, i + val);
                    });
                    // Castling.
                    if (
                        this.castling[this.white_to_play ? 0 : 1][0] &&
                        game_pos.charAt(i + 1) == "-"
                    )
                        this.addIfIsEmpty(game_pos, moves, i, i + 2);
                    if (
                        this.castling[this.white_to_play ? 0 : 1][1] &&
                        game_pos.charAt(i - 1) == "-" &&
                        game_pos.charAt(i - 3) == "-"
                    )
                        this.addIfIsEmpty(game_pos, moves, i, i - 2);
                    break;
                default:
                    break;
            }
        }
        return moves;
    }

    getValidMoves(game_pos = this.pos) {
        if (game_pos == this.pos && this._valid_moves.length > 0)
            return this._valid_moves;
        let allMoves = this.getAllMoves(game_pos);
        let validMoves = [];
        allMoves.forEach((move) => {
            // Check for specific situations (e.g. checks).
            let next_move_board = this.copy();
            next_move_board.registerMove(move, true);
            let eat_king = false;
            next_move_board.getAllMoves().forEach((m) => {
                if (next_move_board.pos.charAt(m[1]).toLowerCase() == "k")
                    eat_king = true;
            });
            // Check for castling checks.
            if (
                game_pos.charAt(move[0]).toLowerCase() == "k" &&
                Math.abs(move[0] - move[1]) == 2
            ) {
                next_move_board = this.copy();
                next_move_board.registerMove(move, true);
                next_move_board.getAllMoves().forEach((m) => {
                    if (
                        [0, 1, 2].includes(
                            (move[0] - m[1]) * (move[0] - move[1] > 0 ? 1 : -1)
                        )
                    )
                        eat_king = true;
                });
            }
            if (!eat_king) validMoves.push(move);
        });
        if (game_pos == this.pos) this._valid_moves = validMoves;
        // If no valid moves, then game result is null or checkmate, depending if the king is in check.
        // WIP.
        return validMoves;
    }

    registerMove(move, future = false) {
        let need_reload = false;
        function replaceAt(str, index, replacement) {
            let out = "";
            for (var i = 0; i < str.length; i++) {
                if (i == index) out += replacement;
                else out += str.charAt(i);
            }
            return out;
        }

        let isValid = false || future;
        let v_moves = [];
        if (!future) {
            v_moves = this.getValidMoves();
            v_moves.forEach((val) => {
                if (val[0] == move[0] && val[1] == move[1]) isValid = true;
            });
        }
        if (!isValid) return true;
        let piece = this.pos.charAt(move[0]);
        // En passant.
        if (piece.toLowerCase() == "p" && this.pos.charAt(move[1]) == "-") {
            if (move[1] - move[0] == -7 * this.direction) {
                this.pos = replaceAt(
                    this.pos,
                    move[0] + 1 * this.direction,
                    "-"
                );
                need_reload = true;
            } else if (move[1] - move[0] == -9 * this.direction) {
                this.pos = replaceAt(
                    this.pos,
                    move[0] + -1 * this.direction,
                    "-"
                );
                need_reload = true;
            }
        }
        if (
            piece.toLowerCase() == "p" &&
            ~~(move[1] / 8) == 0 &&
            this.white_to_play
        ) {
            piece = "Q";
            need_reload = true;
        }
        if (
            piece.toLowerCase() == "p" &&
            ~~(move[1] / 8) == 7 &&
            !this.white_to_play
        ) {
            piece = "q";
            need_reload = true;
        }
        if (piece.toLowerCase() == "r") {
            // Castling.
            if (move[0] % 8 == 7)
                this.castling[this.white_to_play ? 0 : 1][0] = false;
            if (move[0] % 8 == 0)
                this.castling[this.white_to_play ? 0 : 1][1] = false;
        }
        if (this.pos.charAt(move[1]).toLowerCase() == "r") {
            if (move[1] % 8 == 7)
                this.castling[!this.white_to_play ? 0 : 1][0] = false;
            if (move[1] % 8 == 0)
                this.castling[!this.white_to_play ? 0 : 1][1] = false;
        }
        if (piece.toLowerCase() == "k") {
            this.castling[this.white_to_play ? 0 : 1] = [false, false];
            if (move[0] - move[1] == 2) {
                this.pos = replaceAt(this.pos, move[1] - 2, "-");
                this.pos = replaceAt(
                    this.pos,
                    move[1] + 1,
                    this.white_to_play ? "R" : "r"
                );
                need_reload = true;
            }
            if (move[0] - move[1] == -2) {
                this.pos = replaceAt(this.pos, move[1] + 1, "-");
                this.pos = replaceAt(
                    this.pos,
                    move[1] - 1,
                    this.white_to_play ? "R" : "r"
                );
                need_reload = true;
            }
        }
        // Move the piece.
        this.pos = replaceAt(this.pos, move[0], "-");
        this.pos = replaceAt(this.pos, move[1], piece);
        // Prepare next move.
        this.moves_played.push(move);
        this.white_to_play = !this.white_to_play;
        this.direction = -this.direction;
        this._valid_moves = [];
        return need_reload;
    }

    evalPos(game_pos = this.pos) {
        let val = 0;
        for (var i = 0; i < game_pos.length; i++) {
            val += CHAR_VAL[game_pos.charAt(i)];
        }
        return val;
    }
};
