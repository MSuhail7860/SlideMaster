import { useState, useEffect, useRef } from 'react';

// IMPORTANT: Check this path!
// If your utils file is in a "lib" folder, change this to '../lib/utils'
import { solvePuzzle } from '@/lib/utils';

export const usePuzzleSolver = (
    tiles: { value: number }[],
    gridSize: number,
    onMove: (index: number) => void
) => {
    const [isSolving, setIsSolving] = useState(false);
    const [solutionQueue, setSolutionQueue] = useState<number[][]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Helper: Convert object array [{value: 1}, {value: 2}...] to simple number array [1, 2...]
    const getBoardValues = () => tiles.map(t => t.value);

    // --- Feature 1: Hint ---
    // Calculates the immediate next best move without playing it
    const getNextMoveIndex = () => {
        if (gridSize !== 3) return -1;

        const currentBoard = getBoardValues();
        const solution = solvePuzzle(currentBoard);

        if (solution && solution.length > 0) {
            // The solution[0] is the state of the board AFTER the first move.
            // We find where the empty slot (0) is in that new state.
            // That index is the tile the user needs to click.
            const nextBoard = solution[0];
            const nextEmptyIdx = nextBoard.indexOf(0);
            return nextEmptyIdx;
        }
        return -1;
    };

    // --- Feature 2: Auto Solve ---
    // Calculates the full path and starts the animation loop
    const startAutoSolve = () => {
        if (gridSize !== 3) {
            alert("Auto-solve is only available for 3x3 puzzles.");
            return;
        }

        const currentBoard = getBoardValues();
        const solution = solvePuzzle(currentBoard);

        if (solution) {
            setIsSolving(true);
            setSolutionQueue(solution);
        }
    };

    // --- Animation Loop ---
    useEffect(() => {
        if (isSolving && solutionQueue.length > 0) {
            timeoutRef.current = setTimeout(() => {
                const nextBoard = solutionQueue[0];
                const nextEmptyIdx = nextBoard.indexOf(0);

                // Execute the move on the real game board
                onMove(nextEmptyIdx);

                // Remove the move we just played from the queue
                setSolutionQueue(prev => prev.slice(1));

            }, 200); // 200ms delay between moves
        } else if (solutionQueue.length === 0) {
            setIsSolving(false);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [solutionQueue, isSolving, tiles, onMove]);

    return { isSolving, startAutoSolve, getNextMoveIndex };
};