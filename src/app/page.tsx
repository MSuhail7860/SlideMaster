"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "next-themes";
import {
  Shuffle,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Trophy,
  Timer,
  Move,
  Settings2,
  X,
  Lightbulb,
  Bot,
  Moon,
  Sun
} from 'lucide-react';

// Import our hook
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';

// --- Types ---
type Tile = {
  value: number;
  id: number;
};

type PuzzleState = {
  tiles: Tile[];
  rows: number;
  cols: number;
  isSolved: boolean;
  moves: number;
  isPlaying: boolean;
};

// --- Game Logic ---
const isSolved = (tiles: Tile[]): boolean => {
  if (tiles.length === 0) return false;
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i].value !== i + 1) return false;
  }
  return true;
};

const generateSolvedPuzzle = (rows: number, cols: number): Tile[] => {
  const tiles: Tile[] = [];
  for (let i = 0; i < rows * cols; i++) {
    tiles.push({
      value: i === rows * cols - 1 ? 0 : i + 1,
      id: i,
    });
  }
  return tiles;
};

const getValidMoves = (emptyIndex: number, rows: number, cols: number): number[] => {
  const moves: number[] = [];
  const r = Math.floor(emptyIndex / cols);
  const c = emptyIndex % cols;
  if (r > 0) moves.push(emptyIndex - cols);
  if (r < rows - 1) moves.push(emptyIndex + cols);
  if (c > 0) moves.push(emptyIndex - 1);
  if (c < cols - 1) moves.push(emptyIndex + 1);
  return moves;
};

const shufflePuzzle = (initialTiles: Tile[], rows: number, cols: number): Tile[] => {
  let tiles = [...initialTiles];
  let emptyIndex = tiles.findIndex(t => t.value === 0);
  let previousIndex = -1;
  const shuffleCount = rows * cols * 15;
  for (let i = 0; i < shuffleCount; i++) {
    const validMoves = getValidMoves(emptyIndex, rows, cols);
    const distinctMoves = validMoves.filter(m => m !== previousIndex);
    const moveIndex = distinctMoves.length > 0
      ? distinctMoves[Math.floor(Math.random() * distinctMoves.length)]
      : validMoves[Math.floor(Math.random() * validMoves.length)];
    [tiles[emptyIndex], tiles[moveIndex]] = [tiles[moveIndex], tiles[emptyIndex]];
    previousIndex = emptyIndex;
    emptyIndex = moveIndex;
  }
  return tiles;
};

// --- Main Component ---
export default function SlidingPuzzle() {
  const [gridSize, setGridSize] = useState(3);
  const [gameState, setGameState] = useState<PuzzleState>({
    tiles: [],
    rows: 3,
    cols: 3,
    isSolved: false,
    moves: 0,
    isPlaying: false,
  });

  const [seconds, setSeconds] = useState(0);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchStart = useRef({ x: 0, y: 0 });

  // Theme Hook
  const { theme, setTheme } = useTheme();
  // Mount check to prevent hydration mismatch for theme icons
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // --- Move Logic ---
  const moveTile = (index: number) => {
    setGameState(prev => {
      const tiles = [...prev.tiles];
      const emptyIndex = tiles.findIndex(t => t.value === 0);
      const r1 = Math.floor(index / prev.cols);
      const c1 = index % prev.cols;
      const r2 = Math.floor(emptyIndex / prev.cols);
      const c2 = emptyIndex % prev.cols;
      const distance = Math.abs(r1 - r2) + Math.abs(c1 - c2);
      if (distance === 1) {
        [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
        const solved = isSolved(tiles);
        return { ...prev, tiles, moves: prev.moves + 1, isSolved: solved, isPlaying: !solved };
      }
      return prev;
    });
    setHintIndex(null);
  };

  const { isSolving, startAutoSolve, getNextMoveIndex } = usePuzzleSolver(
    gameState.tiles,
    gameState.rows,
    moveTile
  );

  useEffect(() => { startNewGame(gridSize); }, [gridSize]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState.isPlaying && !gameState.isSolved && !isSolving) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.isSolved, isSolving]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSolving) return;
      if (e.key === 'ArrowUp') moveInDirection('up');
      else if (e.key === 'ArrowDown') moveInDirection('down');
      else if (e.key === 'ArrowLeft') moveInDirection('left');
      else if (e.key === 'ArrowRight') moveInDirection('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isSolving]);

  const startNewGame = (size: number) => {
    const solved = generateSolvedPuzzle(size, size);
    const shuffled = shufflePuzzle(solved, size, size);
    setGameState({ tiles: shuffled, rows: size, cols: size, isSolved: false, moves: 0, isPlaying: true });
    setSeconds(0);
    setHintIndex(null);
  };

  const moveInDirection = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameState.isPlaying || gameState.isSolved) return;
    const emptyIndex = gameState.tiles.findIndex(t => t.value === 0);
    const r = Math.floor(emptyIndex / gameState.cols);
    const c = emptyIndex % gameState.cols;
    let targetIndex = -1;
    if (direction === 'up' && r < gameState.rows - 1) targetIndex = emptyIndex + gameState.cols;
    else if (direction === 'down' && r > 0) targetIndex = emptyIndex - gameState.cols;
    else if (direction === 'left' && c < gameState.cols - 1) targetIndex = emptyIndex + 1;
    else if (direction === 'right' && c > 0) targetIndex = emptyIndex - 1;
    if (targetIndex !== -1) moveTile(targetIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!gameState.isPlaying || gameState.isSolved || isSolving) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStart.current.x - touchEndX;
    const diffY = touchStart.current.y - touchEndY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 30) moveInDirection(diffX > 0 ? 'left' : 'right');
    } else {
      if (Math.abs(diffY) > 30) moveInDirection(diffY > 0 ? 'up' : 'down');
    }
  };

  const handleSmartHint = () => {
    if (!gameState.isPlaying || gameState.isSolved || isSolving) return;
    const idx = getNextMoveIndex();
    if (idx !== -1) {
      setHintIndex(idx);
      setTimeout(() => setHintIndex(null), 1500);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => { setCustomImage(evt.target?.result as string); startNewGame(gridSize); };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    // DARK MODE: Main background changed to slate-950 and text to slate-50
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-500/20 shadow-lg">
              15
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hidden sm:block">
              SlideMaster
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            <div className="flex items-center gap-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full transition-colors">
              <Timer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="tabular-nums">{formatTime(seconds)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full transition-colors">
              <Move className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="tabular-nums">{gameState.moves}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* Controls */}
        <div className="w-full md:w-72 space-y-6 shrink-0 order-2 md:order-1">
          {/* Card: Options */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 transition-colors duration-300">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold mb-2">
              <Settings2 className="w-5 h-5" />
              <h2>Game Options</h2>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 4, 5].map(size => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size)}
                    disabled={isSolving}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer border border-transparent
                      ${gridSize === size
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}
                      ${isSolving ? 'opacity-50 cursor-not-allowed' : ''}  
                    `}
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => startNewGame(gridSize)}
                disabled={isSolving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>
              <button
                onClick={() => startNewGame(gridSize)}
                disabled={isSolving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

              <button
                onClick={handleSmartHint}
                disabled={isSolving || gridSize !== 3}
                className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer shadow-blue-500/30 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Lightbulb className="w-4 h-4" />
                Hint
              </button>

              <button
                onClick={startAutoSolve}
                disabled={isSolving || gridSize !== 3}
                className={`flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium cursor-pointer shadow-emerald-500/30 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Bot className="w-4 h-4" />
                {isSolving ? 'Solving...' : 'Solve'}
              </button>
            </div>

            {gridSize !== 3 && (
              <p className="text-xs text-slate-400 text-center">Hint & Solve available for 3x3 only</p>
            )}
          </div>

          {/* Card: Custom Image */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold">
                <ImageIcon className="w-5 h-5" />
                <h2>Custom Image</h2>
              </div>
              {customImage && (
                <button
                  onClick={() => { setCustomImage(null); startNewGame(gridSize); }}
                  disabled={isSolving}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div
              onClick={() => !isSolving && fileInputRef.current?.click()}
              className={`
                group relative w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden
                ${customImage ? 'border-indigo-300 dark:border-indigo-700' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800'}
                ${isSolving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {customImage ? (
                <>
                  <img src={customImage} alt="Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-indigo-700 dark:text-indigo-300">Change Image</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors pointer-events-none" />
                  <span className="text-xs text-slate-500 font-medium pointer-events-none">Click to upload</span>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} disabled={isSolving} className="hidden" />
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 flex flex-col items-center justify-center order-1 md:order-2">
          <div
            className="relative bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 transition-colors duration-300"
            style={{ width: 'min(100%, 500px)', aspectRatio: '1/1' }}
          >
            <div
              className="grid w-full h-full gap-2 touch-none"
              style={{ gridTemplateColumns: `repeat(${gameState.cols}, 1fr)`, gridTemplateRows: `repeat(${gameState.rows}, 1fr)` }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence>
                {gameState.tiles.map((tile, index) => {
                  if (tile.value === 0) return <div key="empty" className="invisible pointer-events-none" />;

                  const originalRow = Math.floor((tile.value - 1) / gameState.cols);
                  const originalCol = (tile.value - 1) % gameState.cols;

                  return (
                    <motion.button
                      layoutId={tile.id.toString()}
                      key={tile.id}
                      onClick={() => !isSolving && moveTile(index)}
                      className={`
                        relative w-full h-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow
                        ${!customImage
                          ? 'bg-indigo-500 hover:bg-indigo-400 dark:bg-indigo-600 dark:hover:bg-indigo-500'
                          : 'bg-slate-200 dark:bg-slate-800'}
                        flex items-center justify-center z-10
                        ${hintIndex === index ? "ring-4 ring-blue-500 z-20" : ""}
                        ${isSolving ? 'cursor-default' : 'cursor-pointer'}
                      `}
                      whileHover={!isSolving ? { scale: 0.98 } : {}}
                      whileTap={!isSolving ? { scale: 0.95 } : {}}
                    >
                      {customImage && (
                        <div
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{
                            backgroundImage: `url(${customImage})`,
                            backgroundSize: `${gameState.cols * 100}% ${gameState.rows * 100}%`,
                            backgroundPosition: `${(originalCol / (gameState.cols - 1)) * 100}% ${(originalRow / (gameState.rows - 1)) * 100}%`
                          }}
                        />
                      )}

                      {(!customImage || (gameState.isPlaying && !gameState.isSolved)) && (
                        <span className={`
                          text-lg sm:text-2xl font-bold z-20 pointer-events-none
                          ${customImage
                            ? 'bg-black/40 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm backdrop-blur-sm'
                            : 'text-white'}
                        `}>
                          {tile.value}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {gameState.isSolved && gameState.moves > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center text-center p-6"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Puzzle Solved!</h2>

                    <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-xs mx-auto">
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Time</div>
                        <div className="text-xl font-bold text-slate-800 dark:text-white">{formatTime(seconds)}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Moves</div>
                        <div className="text-xl font-bold text-slate-800 dark:text-white">{gameState.moves}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => startNewGame(gridSize)}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all cursor-pointer"
                    >
                      Play Again
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-4 text-slate-400 text-sm italic">
            {isSolving ? 'AI is solving the puzzle...' : 'Tip: Click tiles adjacent to the empty space to move them.'}
          </p>
        </div>
      </main>
    </div>
  );
}