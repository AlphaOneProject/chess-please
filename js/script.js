function main(event) {
    var selected_cell = null;

    function getMoves() {
        let moves = [];
        // Get possible moves computed server-side.
        // WIP.
        return moves;
    }

    function handleClick() {
        cells.forEach((cell) => {
            if (cell == this) return;
            cell.classList.remove("selected");
            cell.classList.remove("possible");
        });

        if (
            selected_cell &&
            (this.classList.contains("possible") ||
                selected_cell.firstElementChild)
        ) {
            // Moves the piece to this cell.
            let p1 = selected_cell.firstElementChild;
            selected_cell.removeChild(p1);
            if (this.firstElementChild)
                this.removeChild(this.firstElementChild);
            this.appendChild(p1);
            selected_cell = null;
            this.classList.remove("selected");
            return;
        }

        this.classList.toggle("selected");
        selected_cell = this;

        // If the cell contains a piece.
        if (this.firstElementChild) {
            // Displays possible moves.
            let c_index = cells.indexOf(this);
            getMoves().forEach((move) => {
                if (move[0] != c_index) return;
                cells[move[1]].classList.add("possible");
            });
        }
    }
    let pieces = document.querySelectorAll(".cell img");
    let cells = document.querySelectorAll(".cell");
    cells.forEach(function (cell) {
        cell.addEventListener("click", handleClick);
    });
}

document.addEventListener("DOMContentLoaded", main);
function main(event) {
    var selected_cell = null;
    var selected_index = -1;
    var moves = [];

    function getMoves(c_index) {
        if (moves.length > 0) {
            moves.forEach((move) => {
                if (move[0] != c_index) return;
                cells[move[1]].classList.add("possible");
            });
            return;
        }
        let tmp = null;
        // Get possible moves computed server-side.
        var url = "api?action=getMoves";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                tmp = xhr.responseText.split(";");
                tmp.forEach((val) => {
                    let move = val.split(",");
                    moves.push(move);
                    if (move[0] != c_index) return;
                    cells[move[1]].classList.add("possible");
                });
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
            if (this.firstElementChild)
                this.removeChild(this.firstElementChild);
            this.appendChild(p1);
            selected_cell = null;
            this.classList.remove("selected");
            this.classList.remove("possible");
            // Register the move server-side.
            if (selected_index == c_index) return;
            var url =
                "api?action=sendMove&move=" + selected_index + "," + c_index;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.responseText == "1") {
                        location.reload();
                    }
                    return;
                }
            };
            xhr.send();
            moves = [];
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
    let pieces = document.querySelectorAll(".cell img");
    let cells = document.querySelectorAll(".cell");
    cells.forEach(function (cell) {
        cell.addEventListener("click", handleClick);
    });
}

document.addEventListener("DOMContentLoaded", main);
