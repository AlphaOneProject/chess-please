const fs = require("fs");
const http = require("http");
var path = require("path");

const ChessGame = require("./board.js");

const DNS_NAME = "http://localhost:8080";
const MIME = {
    html: "text/html",
    txt: "text/plain",
    css: "text/css",
    gif: "image/gif",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    js: "application/javascript",
};
const IMG_PATH = "pieces/";
const CHAR_TO_IMG = {
    P: "p0",
    N: "n0",
    B: "b0",
    R: "r0",
    Q: "q0",
    K: "k0",
    p: "p1",
    n: "n1",
    b: "b1",
    r: "r1",
    q: "q1",
    k: "k1",
};

function getHtmlFromPos(pos, board_only = false) {
    // Changes the POV of the board.
    //pos = pos.split("").reverse().join("");
    let html = "";
    if (!board_only) html = fs.readFileSync("./html/base.html");
    let color = "white";
    for (var i = 0; i < pos.length; i++) {
        if (i % 8 != 0) {
            if (color == "white") color = "black";
            else color = "white";
        }
        if (pos.charAt(i) == "-") {
            html += "<div class='cell " + color + "'></div>";
            continue;
        }
        html += "<div class='cell " + color;
        html +=
            "'><img draggable='false' src='" +
            IMG_PATH +
            CHAR_TO_IMG[pos.charAt(i)] +
            ".png'";
        if (pos.charAt(i).toLowerCase() == "p")
            html += " style='max-height: 85%;'";
        else html += " style='max-height: 90%;'";
        html += "></div>";
    }
    if (!board_only) html += "</div></div></body></html>";
    return html;
}

function genId(length = 8) {
    var result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result;
}

const requestListener = function (req, res) {
    function notFound() {
        res.setHeader("Content-Type", "text/plain");
        res.statusCode = 404;
        res.end("Not found");
    }

    let url = req.url;
    if (url.split("?")[0] == "/") {
        if (!req.url.toString().includes("id=")) {
            let new_p1_id = genId();
            let new_p2_id = genId();
            let is_white = Math.random() > 0.5;
            let new_game_id = genId();
            games[new_game_id] = new ChessGame();
            players[new_p1_id] = [new_game_id, is_white];
            players[new_p2_id] = [new_game_id, !is_white];
            console.log("New player: " + DNS_NAME + "/?id=" + new_p1_id);
            console.log("New player: " + DNS_NAME + "/?id=" + new_p2_id);
            res.writeHead(302, {
                location: DNS_NAME + "/?id=" + new_p1_id,
            });
            res.end();
            return;
        }
        let id = req.url.toString().split("id=")[1].split("&")[0];
        if (!players[id]) {
            res.writeHead(302, {
                location: DNS_NAME,
            });
            res.end();
            return;
        }
        res.writeHead(200);
        res.write(getHtmlFromPos(games[players[id][0]].pos));
        res.end();
        console.log("[" + id + "] Loaded");
    } else if (url.startsWith("/api")) {
        let id = req.url.toString().split("id=")[1].split("&")[0];
        if (!players[id]) {
            notFound();
            return;
        }
        let action = req.url.toString().split("action=")[1].split("&")[0];
        if (action == "getMoves") {
            res.setHeader("Content-Type", "text/plain");
            let moves = games[players[id][0]].getValidMoves().join(";");
            res.end(moves);
        } else if (action == "sendMove") {
            let move = req.url
                .toString()
                .split("move=")[1]
                .split("&")[0]
                .split(",");
            move = [parseInt(move[0]), parseInt(move[1])];
            let result = games[players[id][0]].registerMove(move);
            console.log("[" + id + "] Moved: " + move);
            res.writeHead(200);
            if (result)
                res.end(getHtmlFromPos(games[players[id][0]].pos, true));
            else res.end("0");
        } else notFound();
    } else if (
        url.startsWith("/pieces/") ||
        url.startsWith("/css/") ||
        url.startsWith("/js/")
    ) {
        var reqpath = req.url.toString().split("?")[0];
        if (req.method !== "GET") {
            res.statusCode = 501;
            res.setHeader("Content-Type", "text/plain");
            return res.end("Method not implemented");
        }
        var file = path.join(__dirname, reqpath);
        if (file.indexOf(__dirname + path.sep) !== 0) {
            res.statusCode = 403;
            res.setHeader("Content-Type", "text/plain");
            return res.end("Forbidden");
        }
        var type = MIME[path.extname(file).slice(1)] || "text/plain";
        var s = fs.createReadStream(file);
        s.on("open", function () {
            res.setHeader("Content-Type", type);
            s.pipe(res);
        });
        s.on("error", function () {
            notFound();
        });
    } else {
        notFound();
    }
};

var games = {};
var players = {};
const server = http.createServer(requestListener);
server.listen(8080);
