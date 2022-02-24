function main(event) {
    var selected_cell = null;

    function getMoves() {
        let moves = [];
        // Compute possible moves.
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
