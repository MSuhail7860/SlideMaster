import { PuzzleState } from "@/lib/types";
import { Tile } from "./Tile";
import { cn } from "@/lib/utils";

interface PuzzleBoardProps {
    state: PuzzleState;
    onMove: (index: number) => void;
    imageUrl?: string | null;
}

export function PuzzleBoard({ state, onMove, imageUrl }: PuzzleBoardProps) {
    return (
        <div
            className={cn(
                "grid gap-2 w-full max-w-md mx-auto aspect-square p-2 bg-secondary/50 rounded-xl",
            )}
            style={{
                gridTemplateColumns: `repeat(${state.cols}, 1fr)`,
            }}
        >
            {state.tiles.map((tile) => (
                <Tile
                    key={tile.id}
                    tile={tile}
                    rows={state.rows}
                    cols={state.cols}
                    width={0} // Not strictly needed for bg calculation logic
                    onClick={() => onMove(tile.currentPosition)}
                    imageUrl={imageUrl}
                    isSolved={state.isSolved}
                />
            ))}
        </div>
    );
}
