export interface Tile {
    id: number;
    currentPosition: number; // 0 to (rows*cols - 1)
    correctPosition: number; // 0 to (rows*cols - 1)
    isEmpty: boolean;
}

export interface PuzzleState {
    tiles: Tile[];
    rows: number;
    cols: number;
    isSolved: boolean;
    moves: number;
    startTime: number | null; // Timestamp
    isTimerRunning: boolean;
}
