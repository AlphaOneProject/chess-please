var selected_cell = null;
var selected_index = -1;
var moves = [];
var board = null;
var cells = null;
var isSync = true;

function keepAlive() {
    if (isSync) return;
    var url = "api" + window.location.search + "&action=keepAlive";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = function () {
        // Tries to recover the move played by the opponent.
        if (xhr.responseText != 0 && !isSync) {
            board.innerHTML = xhr.responseText;
            cells = document.querySelectorAll(".cell");
            cells.forEach(function (cell) {
                cell.addEventListener("click", handleClick);
            });
            isSync = true;
            getMoves();
        }
        return;
    };
    xhr.send();
    setTimeout(() => {
        keepAlive();
    }, 1000);
}

function getMoves(c_index = null) {
    if (moves.length > 0) {
        if (c_index === null) return;
        moves.forEach((move) => {
            if (move[0] != c_index) return;
            cells[move[1]].classList.add("possible");
        });
        return;
    }
    let tmp = null;
    // Get possible moves computed server-side.
    var url = "api" + window.location.search + "&action=getMoves";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.responseText !== "Not your turn") {
                tmp = xhr.responseText.split(";");
                tmp.forEach((val) => {
                    let move = val.split(",");
                    moves.push(move);
                    if (c_index === null || move[0] != c_index) return;
                    cells[move[1]].classList.add("possible");
                });
            } else {
                isSync = false;
                keepAlive();
            }
            return;
        }
    };
    xhr.send();
}

function handleClick() {
    let c_index = -1;
    cells.forEach((cell, i) => {
        if (cell == this) {
            c_index = i;
            return;
        }
        cell.classList.remove("selected");
        cell.classList.remove("possible");
    });

    if (
        selected_cell &&
        selected_cell.firstElementChild &&
        this.classList.contains("possible")
    ) {
        // Moves the piece to this cell.
        let p1 = selected_cell.firstElementChild;
        selected_cell.removeChild(p1);
        if (this.firstElementChild) this.removeChild(this.firstElementChild);
        this.appendChild(p1);
        selected_cell = null;
        this.classList.remove("selected");
        this.classList.remove("possible");
        // Register the move server-side.
        if (selected_index == c_index) return;
        var url =
            "api" +
            window.location.search +
            "&action=sendMove&move=" +
            selected_index +
            "," +
            c_index;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.responseText != "0") {
                    board.innerHTML = xhr.responseText;
                    cells = document.querySelectorAll(".cell");
                    cells.forEach(function (cell) {
                        cell.addEventListener("click", handleClick);
                    });
                }
                moves.length = 0;
                getMoves();
                return;
            }
        };
        xhr.send();
        return;
    }

    this.classList.toggle("selected");
    selected_cell = this;
    selected_index = c_index;

    // If the cell contains a piece.
    if (this.firstElementChild && this.classList.contains("selected")) {
        // Displays possible moves.
        getMoves(c_index);
    }
}

document.addEventListener("DOMContentLoaded", main);
function main(event) {
    board = document.querySelectorAll("#board")[0];
    cells = document.querySelectorAll(".cell");
    cells.forEach(function (cell) {
        cell.addEventListener("click", handleClick);
    });
    getMoves();
}

document.addEventListener("DOMContentLoaded", main);
