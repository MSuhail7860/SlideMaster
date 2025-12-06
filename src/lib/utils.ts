import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Existing Tailwind Utility ---
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- NEW: Puzzle Solver Logic (A* Algorithm) ---

type Board = number[];

// Directions: Up, Down, Left, Right
// We use these to calculate neighbors for the A* search
const MOVES = [
    { index: -3, direction: 'UP' },
    { index: 3, direction: 'DOWN' },
    { index: -1, direction: 'LEFT' },
    { index: 1, direction: 'RIGHT' }
];

// Heuristic: Manhattan Distance
// Calculates how far every tile is from its target position
const getManhattanDistance = (board: Board): number => {
    let distance = 0;
    for (let i = 0; i < board.length; i++) {
        const value = board[i];
        if (value !== 0) {
            const cx = i % 3;
            const cy = Math.floor(i / 3);
            const targetIndex = value - 1;
            const tx = targetIndex % 3;
            const ty = Math.floor(targetIndex / 3);
            distance += Math.abs(cx - tx) + Math.abs(cy - ty);
        }
    }
    return distance;
};

// Main Solver Function
export const solvePuzzle = (startBoard: Board): Board[] | null => {
    // Safety Check: Only run on 3x3 grids
    if (startBoard.length !== 9) return null;

    const openSet: { f: number, g: number, board: Board, path: Board[] }[] = [];
    const closedSet = new Set<string>();

    openSet.push({
        f: getManhattanDistance(startBoard),
        g: 0,
        board: startBoard,
        path: []
    });

    let iterations = 0;
    const MAX_ITERATIONS = 20000; // Safety brake to prevent browser freeze

    while (openSet.length > 0) {
        // Safety brake
        if (iterations++ > MAX_ITERATIONS) return null;

        // Get the node with the lowest cost (f)
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;

        const boardStr = current.board.toString();
        if (closedSet.has(boardStr)) continue;
        closedSet.add(boardStr);

        // Check if solved: [1,2,3,4,5,6,7,8,0]
        const isSolved = current.board.every((val, idx) =>
            val === (idx === 8 ? 0 : idx + 1)
        );

        if (isSolved) return current.path;

        const emptyIdx = current.board.indexOf(0);
        const emptyX = emptyIdx % 3;

        // Generate valid moves
        for (const move of MOVES) {
            const neighborIdx = emptyIdx + move.index;
            const neighborX = neighborIdx % 3;

            if (neighborIdx >= 0 && neighborIdx < 9) {
                // Prevent horizontal wrapping logic errors
                if (move.direction === 'LEFT' && neighborX > emptyX) continue;
                if (move.direction === 'RIGHT' && neighborX < emptyX) continue;

                const newBoard = [...current.board];
                // Swap tiles
                [newBoard[emptyIdx], newBoard[neighborIdx]] = [newBoard[neighborIdx], newBoard[emptyIdx]];

                if (!closedSet.has(newBoard.toString())) {
                    const g = current.g + 1;
                    const h = getManhattanDistance(newBoard);
                    openSet.push({
                        f: g + h,
                        g: g,
                        board: newBoard,
                        path: [...current.path, newBoard]
                    });
                }
            }
        }
    }
    return null;
};