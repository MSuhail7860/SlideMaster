import { Button } from "@/components/ui/button";
import { Upload, Shuffle, RefreshCw, Grid3x3, Grid2x2 } from "lucide-react";
import { ChangeEvent, useRef } from "react";

interface ControlsProps {
    onShuffle: () => void;
    onReset: () => void;
    onUpload: (file: File) => void;
    onClearImage: () => void;
    rows: number;
    setRows: (rows: number) => void;
    moves: number;
    timer: number;
    isTimerRunning: boolean;
    hasCustomImage: boolean;
}

export function Controls({
    onShuffle,
    onReset,
    onUpload,
    onClearImage,
    rows,
    setRows,
    moves,
    timer,
    isTimerRunning,
    hasCustomImage,
}: ControlsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-4 bg-card rounded-xl shadow-sm border mt-4">
            {/* Stats */}
            <div className="flex justify-between items-center text-lg font-mono font-medium">
                <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-xs uppercase">Moves</span>
                    <span>{moves}</span>
                </div>
                <div className={`flex flex-col items-center ${isTimerRunning ? "text-primary" : "text-muted-foreground"}`}>
                    <span className="text-muted-foreground text-xs uppercase">Time</span>
                    <span>{formatTime(timer)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button onClick={onShuffle} variant="default" className="w-full">
                    <Shuffle className="mr-2 h-4 w-4" /> Shuffle
                </Button>
                <Button onClick={onReset} variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={rows === 3 ? "default" : "secondary"}
                    className="flex-1"
                    onClick={() => setRows(3)}
                >
                    <Grid2x2 className="mr-2 h-4 w-4" /> 3x3
                </Button>
                <Button
                    variant={rows === 4 ? "default" : "secondary"}
                    className="flex-1"
                    onClick={() => setRows(4)}
                >
                    <Grid3x3 className="mr-2 h-4 w-4" /> 4x4
                </Button>
            </div>

            <div className="flex gap-2">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mr-2 h-4 w-4" /> {hasCustomImage ? "Change Photo" : "Upload Photo"}
                </Button>
                {hasCustomImage && (
                    <Button variant="destructive" onClick={onClearImage}>
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
