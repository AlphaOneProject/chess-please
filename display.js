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

function getHtmlFromPos(pos) {
    // Changes the POV of the board.
    //pos = pos.split("").reverse().join("");
    let html = fs.readFileSync("./html/base.html");
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
    return html + "</div></div></body></html>";
}

const requestListener = function (req, res) {
    function notFound() {
        res.setHeader("Content-Type", "text/plain");
        res.statusCode = 404;
        res.end("Not found");
    }

    let url = req.url;
    if (url == "/") {
        res.writeHead(200);
        res.write(getHtmlFromPos(game.pos));
        res.end();
    } else if (url.startsWith("/api")) {
        let action = req.url.toString().split("?action=")[1].split("&")[0];
        if (action == "getMoves") {
            res.setHeader("Content-Type", "text/plain");
            let moves = game.getValidMoves().join(";");
            res.end(moves);
        } else if (action == "sendMove") {
            let move = req.url
                .toString()
                .split("&move=")[1]
                .split("&")[0]
                .split(",");
            let result = game.registerMove(move);
            console.log("Moved: " + move + " (" + result + ")");
            res.writeHead(200);
            res.end();
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

var game = new ChessGame();
const server = http.createServer(requestListener);
server.listen(8080);
