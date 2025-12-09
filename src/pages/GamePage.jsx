import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Brain, Hash, MemoryStick, Check, X, RotateCcw, Zap, Loader2,
  Trophy, Star, Target, Clock, BarChart3, Crown, Sparkles, Award
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Enhanced Local Storage Hook ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// --- AI Configuration ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. Please add it to your .env.local file");
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper to clean AI response
const cleanAiJson = (text) => {
  const firstBracket = text.indexOf('{');
  const lastBracket = text.lastIndexOf('}');
  if (firstBracket === -1 || lastBracket === -1) {
    throw new Error("AI response did not contain a valid JSON object.");
  }
  return text.substring(firstBracket, lastBracket + 1);
};

// --- Enhanced Word Puzzle Game ---
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

const WordPuzzleGame = () => {
  const [solutionObj, setSolutionObj] = useLocalStorage('wordpuzzle-solution', null);
  const [guesses, setGuesses] = useLocalStorage('wordpuzzle-guesses', Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useLocalStorage('wordpuzzle-currentGuess', '');
  const [isWon, setIsWon] = useLocalStorage('wordpuzzle-isWon', false);
  const [isLost, setIsLost] = useLocalStorage('wordpuzzle-isLost', false);
  const [stats, setStats] = useLocalStorage('wordpuzzle-stats', {
    played: 0,
    wins: 0,
    streak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0]
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [hint, setHint] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const solution = solutionObj?.word;

  const currentRow = useMemo(() => guesses.findIndex(g => g === ''), [guesses]);
  const gameOver = useMemo(() => isWon || isLost || currentRow === -1, [isWon, isLost, currentRow]);

  const startNewGame = useCallback(async () => {
    setIsGenerating(true);
    setAiError(null);
    setHint(null);
    setShowStats(false);

    const wasPlayed = guesses.some(g => g !== '');
    if (isLost || (wasPlayed && !isWon)) {
      setStats(prev => ({
        ...prev,
        played: prev.played + (wasPlayed ? 1 : 0),
        streak: 0
      }));
    } else if (isWon) {
      // Win stats are handled in handleKeydown
    } else if (wasPlayed) {
      setStats(prev => ({...prev, played: prev.played + 1}));
    }

    setIsWon(false);
    setIsLost(false);
    setGuesses(Array(6).fill(''));
    setCurrentGuess('');

    try {
      const prompt = `
        You are a game master and lexicographer.
        Your task is to generate a single, common, 5-letter English word and a short, clever, one-sentence hint for it.

        To ensure variety, please select a word at random. Avoid obscure words.
        The word can be from any common topic, like "technology", "nature", "food", or "everyday objects".

        CRITICAL CONSTRAINTS:
        1. The "word" MUST be exactly 5 letters long and in uppercase.
        2. The "hint" MUST be a single, short sentence.
        3. You MUST return ONLY a valid, minified JSON object in this exact format. Do not include "json", markdown backticks, or any other text before or after the JSON object.

        Example of a perfect response:
        {"word":"CLOUD","hint":"Water vapor in the sky, or a computing service."}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      const parsed = JSON.parse(cleanAiJson(text));

      if (!parsed.word || parsed.word.length !== 5) {
        throw new Error("AI generated an invalid word.");
      }

      parsed.word = parsed.word.toUpperCase();
      setSolutionObj(parsed);

    } catch (err) {
      console.error("AI Generation Error:", err);
      setAiError("Failed to generate a new game. Using a fallback word.");
      setSolutionObj({ word: 'REACT', hint: 'A popular UI library by Meta' });
    }
    setIsGenerating(false);
  }, [setSolutionObj, setGuesses, setCurrentGuess, setIsWon, setIsLost, setHint, setStats, isWon, isLost, guesses]);

  useEffect(() => {
    if (!solutionObj || gameOver) {
      startNewGame();
    }
  }, [solutionObj, gameOver, startNewGame]);

  const handleKeydown = useCallback((e) => {
    if (gameOver || isGenerating || !solution) return;

    const key = e.key.toUpperCase();

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) return;

      const newGuesses = [...guesses];
      newGuesses[currentRow] = currentGuess;
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === solution) {
        setIsWon(true);
        setStats(prev => {
          const newDistribution = [...prev.distribution];
          newDistribution[currentRow] += 1;
          return {
            played: prev.played + 1,
            wins: prev.wins + 1,
            streak: prev.streak + 1,
            maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
            distribution: newDistribution
          };
        });
      } else if (currentRow === 5) {
        setIsLost(true);
        setStats(prev => ({
          ...prev,
          played: prev.played + 1,
          streak: 0
        }));
      }
      return;
    }

    if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }

    if (currentGuess.length < 5 && key.match(/^[A-Z]$/)) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, guesses, currentRow, solution, gameOver, isGenerating, setGuesses, setCurrentGuess, setIsWon, setIsLost, setStats]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  const handleKeyClick = (key) => {
    if (key === 'BACK') handleKeydown({ key: 'Backspace' });
    else handleKeydown({ key });
  };

  const handleHintClick = () => {
    setHint(solutionObj.hint);
  };

  const getLetterStatus = useCallback((letter, index, guess) => {
    if (!letter || !solution || !guess) return 'border-gray-300 bg-white';
    const guessArray = guess.split('');
    const solutionArray = solution.split('');
    if (solution[index] === letter) {
      return 'bg-green-500 border-green-500 text-white';
    }
    if (solution.includes(letter)) {
      const solutionCount = solutionArray.filter(l => l === letter).length;
      const guessCount = guessArray.filter(l => l === letter).length;
      const correctCount = solutionArray.filter((l, i) => l === letter && guessArray[i] === letter).length;
      const guessCountBefore = guessArray.slice(0, index).filter(l => l === letter).length;
      if (guessCountBefore < (solutionCount - correctCount)) {
         return 'bg-yellow-500 border-yellow-500 text-white';
      }
    }
    return 'bg-gray-500 border-gray-500 text-white';
  }, [solution]);

  const usedKeys = useMemo(() => {
    const keys = {};
    if (!solution) return keys;
    guesses.forEach(guess => {
      if (!guess) return;
      const guessArray = guess.split('');
      guessArray.forEach((letter, index) => {
        if (!letter) return;
        const status = getLetterStatus(letter, index, guess);
        if (status === 'bg-green-500 border-green-500 text-white') {
          keys[letter] = 'bg-green-500 text-white';
        } else if (status === 'bg-yellow-500 border-yellow-500 text-white' && keys[letter] !== 'bg-green-500 text-white') {
          keys[letter] = 'bg-yellow-500 text-white';
        } else if (status === 'bg-gray-500 border-gray-500 text-white' && !keys[letter]) {
          keys[letter] = 'bg-gray-500 text-white';
        }
      });
    });
    return keys;
  }, [guesses, solution, getLetterStatus]);

  const winPercentage = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  if (isGenerating && !solutionObj) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-4"
        />
        <p className="text-gray-600 text-lg font-medium">Generating your word puzzle...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      {/* Enhanced Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Word Puzzle</h2>
        <p className="text-gray-600">Guess the 5-letter word in 6 tries</p>
      </div>

      {/* Enhanced Stats Display */}
      <div className="grid grid-cols-4 gap-3 mb-6 w-full">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.played}</p>
          <p className="text-xs text-gray-500 font-medium">Played</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{winPercentage}%</p>
          <p className="text-xs text-gray-500 font-medium">Win Rate</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.streak}</p>
          <p className="text-xs text-gray-500 font-medium">Streak</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.maxStreak}</p>
          <p className="text-xs text-gray-500 font-medium">Max</p>
        </div>
      </div>

      {/* AI Error Message */}
      {aiError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center"
        >
          <p className="font-medium">{aiError}</p>
        </motion.div>
      )}

      {/* Enhanced Game Grid */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, r) => {
          const guess = guesses[r];
          const isCurrentRow = (r === currentRow && !gameOver);
          return Array.from({ length: 5 }).map((_, c) => {
            const letter = isCurrentRow ? currentGuess[c] : (guess ? guess[c] : '');
            const status = guess ? getLetterStatus(letter, c, guess) : '';
            return (
              <motion.div
                key={`${r}-${c}`}
                initial={false}
                animate={{
                  scale: (isCurrentRow && letter) ? [1, 1.1, 1] : 1,
                  rotateX: guess ? [0, -90, 0] : 0
                }}
                transition={{ duration: 0.3 }}
                className={`w-14 h-14 sm:w-16 sm:h-16 border-2 rounded-lg flex items-center justify-center text-2xl font-bold uppercase
                  ${guess ? status : 'border-gray-300 bg-white'}
                  ${(isCurrentRow && letter) ? 'border-gray-500 shadow-sm' : ''}
                  transition-all duration-300 shadow-sm
                `}
              >
                {letter}
              </motion.div>
            );
          });
        })}
      </div>

      {/* Enhanced Game Controls */}
      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center mb-6 p-6 bg-green-50 border border-green-200 rounded-2xl"
          >
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Trophy className="text-green-600" size={24} />
              <p className="text-xl font-bold text-green-600">Congratulations!</p>
            </div>
            <p className="text-gray-700 mb-4">You solved it in {currentRow + 1} tries!</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300"
              >
                <BarChart3 size={16} />
                Stats
              </button>
              <button
                onClick={startNewGame}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isGenerating ? 'Generating...' : 'New Game'}
              </button>
            </div>
          </motion.div>
        )}

        {isLost && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl"
          >
            <div className="flex items-center justify-center space-x-2 mb-3">
              <X className="text-red-600" size={24} />
              <p className="text-xl font-bold text-red-600">Game Over</p>
            </div>
            <p className="text-gray-700 mb-4">The word was: <span className="font-bold">{solution}</span></p>
            <button
              onClick={startNewGame}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 mx-auto"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
              {isGenerating ? 'Generating...' : 'Try Again'}
            </button>
          </motion.div>
        )}

        {!gameOver && !hint && !isGenerating && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleHintClick}
            className="mb-6 flex items-center gap-2 bg-blue-100 text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-200 transition-colors shadow-sm"
          >
            <Zap size={18} />
            Get AI Hint
          </motion.button>
        )}

        {hint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-sm"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Brain className="text-blue-600" size={18} />
              <p className="text-sm font-semibold text-blue-800">AI Hint</p>
            </div>
            <p className="text-sm text-gray-700">{hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Keyboard */}
      {!gameOver && !isGenerating && (
        <div className="space-y-2 w-full">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex justify-center gap-1.5">
              {row.map((key) => {
                const isSpecialKey = key === 'ENTER' || key === 'BACK';
                const keyClass = usedKeys[key] || 'bg-gray-200 text-gray-800 hover:bg-gray-300';
                return (
                  <motion.button
                    key={key}
                    onClick={() => handleKeyClick(key)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={gameOver}
                    className={`h-12 px-2 sm:px-4 rounded-lg font-semibold uppercase transition-all duration-200 flex-1
                      ${isSpecialKey ? 'bg-gray-300 text-gray-800 hover:bg-gray-400' : keyClass}
                      ${gameOver ? 'opacity-50 cursor-not-allowed' : 'shadow-sm'}
                    `}
                  >
                    {key === 'BACK' ? '⌫' : key}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Statistics Modal */}
      <AnimatePresence>
        {showStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-primary">Statistics</h3>
                <button onClick={() => setShowStats(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-primary">{stats.played}</p>
                  <p className="text-sm text-gray-500">Played</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-primary">{winPercentage}%</p>
                  <p className="text-sm text-gray-500">Win %</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-primary">{stats.streak}</p>
                  <p className="text-sm text-gray-500">Current Streak</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-primary">{stats.maxStreak}</p>
                  <p className="text-sm text-gray-500">Max Streak</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-primary mb-3">Guess Distribution</h4>
                <div className="space-y-2">
                  {stats.distribution.map((count, index) => {
                    const percentage = stats.wins > 0 ? Math.round((count / stats.wins) * 100) : 0;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-600 w-4">{index + 1}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2"
                          >
                            {count > 0 && (
                              <span className="text-xs font-bold text-white">{count}</span>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Enhanced Sudoku Game ---
const isValidSudoku = (board) => {
  for (let i = 0; i < 9; i++) {
    const row = new Set();
    const col = new Set();
    const box = new Set();

    for (let j = 0; j < 9; j++) {
      if (board[i][j] !== 0) {
        if (row.has(board[i][j])) return false;
        row.add(board[i][j]);
      }

      if (board[j][i] !== 0) {
        if (col.has(board[j][i])) return false;
        col.add(board[j][i]);
      }

      const boxRow = 3 * Math.floor(i / 3) + Math.floor(j / 3);
      const boxCol = 3 * (i % 3) + (j % 3);
      const boxValue = board[boxRow][boxCol];

      if (boxValue !== 0) {
        if (box.has(boxValue)) return false;
        box.add(boxValue);
      }
    }
  }
  return true;
};

const isBoardComplete = (board) => {
  return board.every(row => row.every(cell => cell !== 0));
};

const SudokuGame = () => {
  const initialBoard = useMemo(() => [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ], []);

  const [board, setBoard] = useLocalStorage('sudoku-board', JSON.parse(JSON.stringify(initialBoard)));
  const [given] = useState(() => initialBoard.map(row => row.map(cell => cell !== 0)));
  const [status, setStatus] = useState('');
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCellChange = (e, r, c) => {
    if (given[r][c]) return;

    const value = e.target.value;
    if (value === '' || (value >= '1' && value <= '9')) {
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = value === '' ? 0 : parseInt(value, 10);
      setBoard(newBoard);
      setStatus('');

      if (!isActive) {
        setIsActive(true);
      }
    }
  };

  const handleCheck = () => {
    if (!isBoardComplete(board)) {
      setStatus('INCOMPLETE');
      setTimeout(() => setStatus(''), 2000);
      return;
    }

    if (isValidSudoku(board)) {
      setStatus('SOLVED');
      setIsActive(false);
    } else {
      setStatus('ERROR');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  const handleReset = () => {
    setBoard(JSON.parse(JSON.stringify(initialBoard)));
    setStatus('');
    setTimer(0);
    setIsActive(false);
  };

  const handleNewGame = () => {
    handleReset();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Enhanced Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Sudoku Challenge</h2>
        <p className="text-gray-600">Fill the grid so every row, column, and 3x3 box contains 1-9</p>
      </div>

      {/* Timer and Stats */}
      <div className="flex gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-3 text-center min-w-24">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Clock size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Time</span>
          </div>
          <p className="text-xl font-bold text-primary">{formatTime(timer)}</p>
        </div>
      </div>

      {/* Enhanced Sudoku Grid */}
      <div className="grid grid-cols-9 gap-0.5 bg-gray-800 border-2 border-gray-800 rounded-lg overflow-hidden shadow-lg mb-6">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const rowBorder = (r % 3 === 2 && r !== 8) ? "border-b-2 border-gray-600" : "border-b-0";
            const colBorder = (c % 3 === 2 && c !== 8) ? "border-r-2 border-gray-600" : "border-r-0";
            const isGiven = given[r][c];

            return (
              <div key={`${r}-${c}`} className={`w-10 h-10 sm:w-12 sm:h-12 border-gray-400 ${rowBorder} ${colBorder}`}>
                {isGiven ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xl font-bold text-gray-800">
                    {cell}
                  </div>
                ) : (
                  <input
                    type="number"
                    onInput={(e) => { if (e.target.value.length > 1) e.target.value = e.target.value.slice(0, 1); }}
                    value={cell === 0 ? '' : cell}
                    onChange={(e) => handleCellChange(e, r, c)}
                    className="w-full h-full text-center text-xl font-semibold bg-white text-blue-600 p-0 border-0 focus:ring-2 focus:ring-blue-500 focus:z-10 transition-colors"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Enhanced Status Messages */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-4 rounded-xl border text-center ${
              status === 'SOLVED' ? 'bg-green-50 border-green-200 text-green-700' :
              status === 'ERROR' ? 'bg-red-50 border-red-200 text-red-700' :
              'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {status === 'SOLVED' && <Trophy size={20} />}
              {status === 'ERROR' && <X size={20} />}
              {status === 'INCOMPLETE' && <Target size={20} />}
              <p className="font-semibold">
                {status === 'SOLVED' && 'Perfect! Puzzle solved!'}
                {status === 'ERROR' && 'Some numbers conflict. Keep trying!'}
                {status === 'INCOMPLETE' && 'Please fill in all cells first.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Controls */}
      <div className="flex gap-3">
        <motion.button
          onClick={handleReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors shadow-sm"
        >
          <RotateCcw size={18} />
          Reset
        </motion.button>
        <motion.button
          onClick={handleCheck}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-sm"
        >
          <Check size={18} />
          Check Solution
        </motion.button>
      </div>
    </div>
  );
};

// --- Enhanced Memory Match Game ---
const ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

const MemoryMatchGame = () => {
  const [cards, setCards] = useLocalStorage('memory-cards', []);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useLocalStorage('memory-moves', 0);
  const [bestScore, setBestScore] = useLocalStorage('memory-bestScore', 0);
  const [isWon, setIsWon] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && !isWon) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isWon]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const createBoard = useCallback(() => {
    const shuffledIcons = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffledIcons);
    setMoves(0);
    setFlipped([]);
    setIsWon(false);
    setIsChecking(false);
    setTimer(0);
    setIsActive(true);
  }, [setCards, setMoves]);

  useEffect(() => {
    if (cards.length === 0 || cards.every(c => c.isMatched)) {
      createBoard();
    }
  }, [cards, createBoard]);

  const handleCardClick = useCallback((index) => {
    if (isChecking || flipped.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    if (!isActive) {
      setIsActive(true);
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    setCards(prevCards => prevCards.map((card, i) =>
      i === index ? { ...card, isFlipped: true } : card
    ));

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map((card, i) =>
              newFlipped.includes(i) ? { ...card, isMatched: true, isFlipped: true } : card
            )
          );
          setFlipped([]);
          setIsChecking(false);
        }, 800);
      } else {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map((card, i) =>
              newFlipped.includes(i) ? { ...card, isFlipped: false } : card
            )
          );
          setFlipped([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [cards, flipped, isChecking, isActive, setCards, setMoves]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setIsWon(true);
      setIsActive(false);
      if (bestScore === 0 || moves < bestScore) {
        setBestScore(moves);
      }
    }
  }, [cards, moves, bestScore, setBestScore]);

  return (
    <div className="flex flex-col items-center">
      {/* Enhanced Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Memory Match</h2>
        <p className="text-gray-600">Find all matching pairs of cards</p>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Clock size={14} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Time</span>
          </div>
          <p className="text-xl font-bold text-primary">{formatTime(timer)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <span className="text-sm font-medium text-gray-500">Moves</span>
          <p className="text-xl font-bold text-primary">{moves}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <span className="text-sm font-medium text-gray-500">Best</span>
          <p className="text-xl font-bold text-primary">{bestScore || '-'}</p>
        </div>
      </div>

      {/* Enhanced Win Message */}
      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-6 bg-green-50 border border-green-200 rounded-2xl text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Award className="text-green-600" size={24} />
              <p className="text-xl font-bold text-green-600">Perfect Memory!</p>
            </div>
            <p className="text-gray-700 mb-2">
              You found all pairs in {moves} moves and {formatTime(timer)}!
            </p>
            {moves === bestScore && (
              <p className="text-sm text-green-600 font-semibold">New best score! 🎉</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Game Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6 max-w-sm mx-auto">
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={isChecking || card.isMatched}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotateY: (card.isFlipped || card.isMatched) ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-lg transform-gpu
              ${card.isMatched ? 'opacity-50' : ''}
              ${isChecking ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="absolute inset-0 backface-hidden flex items-center justify-center bg-gradient-to-br from-gray-800 to-primary rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200">
              <Star className="text-yellow-400 opacity-60" size={20} />
            </div>
            <div className="absolute inset-0 backface-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl" style={{ transform: 'rotateY(180deg)' }}>
              <span className="text-3xl sm:text-4xl">{card.icon}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={createBoard}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-sm"
      >
        <RotateCcw size={18} />
        New Game
      </motion.button>
    </div>
  );
};

// --- Enhanced Main Game Page ---
const GamePage = () => {
  const [activeGame, setActiveGame] = useState('wordPuzzle');

  const games = [
    {
      id: 'wordPuzzle',
      name: 'Word Puzzle',
      icon: Brain,
      description: 'AI-powered word challenge',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'sudoku',
      name: 'Sudoku',
      icon: Hash,
      description: 'Classic number puzzle',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'memory',
      name: 'Memory Match',
      icon: MemoryStick,
      description: 'Test your memory skills',
      color: 'from-orange-500 to-red-600'
    },
  ];

  const renderGame = () => {
    switch (activeGame) {
      case 'wordPuzzle': return <WordPuzzleGame />;
      case 'sudoku': return <SudokuGame />;
      case 'memory': return <MemoryMatchGame />;
      default: return null;
    }
  };

  const CustomStyles = () => (
    <style>{`
      .transform-gpu { transform: translateZ(0); }
      .rotate-y-180 { transform: rotateY(180deg); }
      .backface-hidden { backface-visibility: hidden; }
    `}</style>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8"
    >
      <CustomStyles />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-gray-800 rounded-2xl shadow-lg mb-6"
          >
            <Gamepad2 className="text-white" size={32} />
          </motion.div>
          <h1 className="text-4xl font-bold text-primary mb-4">Brain Games Arena</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Challenge your mind with our collection of engaging puzzles and games.
            All progress is saved automatically.
          </p>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-sm border border-gray-200">
            {games.map(game => {
              const Icon = game.icon;
              const isActive = activeGame === game.id;
              const activeGameConfig = games.find(g => g.id === activeGame);

              return (
                <motion.button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 bg-white/50'
                  }`}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${game.color.split(' ').map(c => c.replace('from-', '').replace('to-', '')).join(', ')})`
                      : 'transparent'
                  }}
                >
                  <Icon size={18} />
                  <span>{game.name}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-primary to-gray-800 rounded-xl -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Game Content Area */}
        <motion.div
          key={activeGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl p-8 min-h-[600px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
              {renderGame()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Game Description Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-500 text-sm">
            All games automatically save your progress. Switch between games anytime!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GamePage;
