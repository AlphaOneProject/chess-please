const fs = require("fs");
const http = require("http");
var path = require("path");

const ChessGame = require("./board.js");

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
        html +=
            "<div class='cell " +
            color +
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

const requestListener = function (req, res) {
    function notFound() {
        res.setHeader("Content-Type", "text/plain");
        res.statusCode = 404;
        res.end("Not found");
    }

    let url = req.url;
    if (url.split("?")[0] == "/") {
        if (!req.url.toString().includes("id=")) {
            return;
        }
        let id = req.url.toString().split("id=")[1].split("&")[0];
        res.writeHead(200);
        if (!games[id]) games[id] = new ChessGame();
        res.write(getHtmlFromPos(games[id].pos));
        res.end();
    } else if (url.startsWith("/api")) {
        let id = req.url.toString().split("id=")[1].split("&")[0];
        let action = req.url.toString().split("action=")[1].split("&")[0];
        if (action == "getMoves") {
            res.setHeader("Content-Type", "text/plain");
            let moves = games[id].getValidMoves().join(";");
            res.end(moves);
        } else if (action == "sendMove") {
            let move = req.url
                .toString()
                .split("move=")[1]
                .split("&")[0]
                .split(",");
            move = [parseInt(move[0]), parseInt(move[1])];
            let result = games[id].registerMove(move);
            console.log("Moved: " + move + " (" + result + ")");
            res.writeHead(200);
            if (result) res.end(getHtmlFromPos(games[id].pos, true));
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
const server = http.createServer(requestListener);
server.listen(8080);
