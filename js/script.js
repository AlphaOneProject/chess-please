function main(event) {
    function getMoves() {
        let moves = [];
        // Compute possible moves.
        // WIP.
        return moves;
    }

    function handleClick() {
        if (this.classList.contains("possible")) {
            // Moves the piece to this cell.
            // WIP.
        }
        cells.forEach((cell) => {
            if (cell == this) return;
            cell.classList.remove("selected");
            cell.classList.remove("possible");
        });
        this.classList.toggle("selected");

        // If the cell contains a piece.
        if (this.firstElementChild) {
            // Displays possible moves.
            getMoves().forEach((move) => {
                // WIP.
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
