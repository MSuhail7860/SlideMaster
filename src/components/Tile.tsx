import { motion } from "framer-motion";
import { Tile as TileType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TileProps {
    tile: TileType;
    rows: number;
    cols: number;
    width: number; // width of the board in pixels (approx) or purely percent
    onClick: () => void;
    imageUrl?: string | null;
    isSolved: boolean;
}

export function Tile({ tile, rows, cols, onClick, imageUrl, isSolved }: TileProps) {
    // If no image, show numbers.
    // If image, assume background positioning.

    if (tile.isEmpty) {
        return <div className="invisible" />;
    }

    // Calculate background position based on CORRECT position
    // e.g. for 3x3:
    // 0 -> 0% 0%
    // 1 -> 50% 0%
    // 2 -> 100% 0%
    // 3 -> 0% 50%
    // ...
    const correctRow = Math.floor(tile.correctPosition / cols);
    const correctCol = tile.correctPosition % cols;

    const bgX = (correctCol / (cols - 1)) * 100;
    const bgY = (correctRow / (rows - 1)) * 100;

    return (
        <motion.button
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={onClick}
            className={cn(
                "relative flex items-center justify-center rounded-lg shadow-md overflow-hidden",
                "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
                imageUrl ? "bg-cover" : "bg-primary text-primary-foreground font-bold text-2xl"
            )}
            style={{
                aspectRatio: "1 / 1",
                backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                backgroundPosition: imageUrl ? `${bgX}% ${bgY}%` : undefined,
                backgroundSize: imageUrl ? `${cols * 100}% ${rows * 100}%` : undefined, // Size relative to the tile
            }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
        >
            {!imageUrl && (
                <span>{tile.id + 1}</span>
            )}

            {/* Optional: Show numbers on top of image with low opacity if desired, or toggleable */}
            {imageUrl && !isSolved && (
                <span className="absolute bottom-1 right-2 text-xs font-bold text-white drop-shadow-md opacity-70">
                    {tile.id + 1}
                </span>
            )}
        </motion.button>
    );
}
