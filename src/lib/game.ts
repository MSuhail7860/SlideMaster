import { Tile } from "./types";

/**
 * Checks if a given puzzle state is solvable.
 * For a grid of width N:
 * - If N is odd, number of inversions must be even.
 * - If N is even:
 *   - If row of blank (from bottom) is odd, inversions must be even.
 *   - If row of blank (from bottom) is even, inversions must be odd.
 */
export function isSolvable(tiles: number[], rows: number, cols: number): boolean {
    let inversions = 0;
    const size = rows * cols;

    // Count inversions
    for (let i = 0; i < size - 1; i++) {
        for (let j = i + 1; j < size; j++) {
            // Skip the empty tile (represented by size-1 usually, or a specific value)
            // Here we assume tiles array contains 0..(size-1), where size-1 is empty.
            // But let's clarify the input: simple array of numbers representing correct positions.
            if (tiles[i] !== size - 1 && tiles[j] !== size - 1 && tiles[i] > tiles[j]) {
                inversions++;
            }
        }
    }

    // Find empty tile row from bottom (1-indexed)
    const emptyIndex = tiles.indexOf(size - 1);
    const emptyRowFromBottom = rows - Math.floor(emptyIndex / cols);

    if (cols % 2 !== 0) {
        // Odd width
        return inversions % 2 === 0;
    } else {
        // Even width
        if (emptyRowFromBottom % 2 !== 0) {
            // Blank on odd row from bottom
            return inversions % 2 === 0;
        } else {
            // Blank on even row from bottom
            return inversions % 2 !== 0;
        }
    }
}

/**
 * Generates a solved board state.
 */
export function generateSolvedPuzzle(rows: number, cols: number): Tile[] {
    const size = rows * cols;
    const tiles: Tile[] = [];

    for (let i = 0; i < size; i++) {
        tiles.push({
            id: i,
            currentPosition: i,
            correctPosition: i,
            isEmpty: i === size - 1,
        });
    }

    return tiles;
}

/**
 * Shuffles the puzzle to a solvable state.
 */
export function shufflePuzzle(rows: number, cols: number): Tile[] {
    const size = rows * cols;
    let numbers = Array.from({ length: size }, (_, i) => i);
    let solvable = false;

    // Ideally, just doing random valid moves from solved state is better, 
    // but for "true" shuffle feel, we random permutation + check.
    while (!solvable) {
        // Shuffle numbers
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        solvable = isSolvable(numbers, rows, cols);
    }

    // Map numbers to Tiles
    return numbers.map((val, index) => ({
        id: val,
        currentPosition: index,
        correctPosition: val,
        isEmpty: val === size - 1,
    }));
}

/**
 * Checks if the tile at index can move into the empty spot.
 * Returns the index of the empty spot if valid, or -1.
 */
export function canMove(
    index: number,
    emptyIndex: number,
    rows: number,
    cols: number
): boolean {
    if (index < 0 || index >= rows * cols) return false;

    const row = Math.floor(index / cols);
    const col = index % cols;
    const emptyRow = Math.floor(emptyIndex / cols);
    const emptyCol = emptyIndex % cols;

    const isAdjacent =
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    return isAdjacent;
}

/**
 * Swaps a tile with the empty tile if valid.
 */
export function moveTile(tiles: Tile[], index: number, rows: number, cols: number): Tile[] {
    const emptyTile = tiles.find(t => t.isEmpty);
    if (!emptyTile) return tiles;

    // We need to find the tile object that is at 'index' in the visual grid, 
    // but our 'tiles' array might not be sorted by currentPosition. 
    // Wait, let's keep 'tiles' sorted by 'currentPosition' to represent the grid?
    // OR keep 'tiles' as a list of objects where 'currentPosition' changes?
    // OPTION 2: List of objects is better for Framer Motion 'layout' prop.
    // The 'tiles' array order doesn't matter for logic if we use 'currentPosition'.

    const tileToMove = tiles.find(t => t.currentPosition === index);
    const emptyTileObj = tiles.find(t => t.isEmpty);

    if (!tileToMove || !emptyTileObj) return tiles;

    if (canMove(tileToMove.currentPosition, emptyTileObj.currentPosition, rows, cols)) {
        // Swap positions
        const newPos = emptyTileObj.currentPosition;
        const oldPos = tileToMove.currentPosition;

        return tiles.map(t => {
            if (t.id === tileToMove.id) {
                return { ...t, currentPosition: newPos };
            }
            if (t.id === emptyTileObj.id) {
                return { ...t, currentPosition: oldPos };
            }
            return t;
        });
    }

    return tiles;
}

export function isSolved(tiles: Tile[]): boolean {
    return tiles.every(t => t.currentPosition === t.correctPosition);
}
