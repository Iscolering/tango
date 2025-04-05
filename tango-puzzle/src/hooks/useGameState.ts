import { useState, useCallback, useEffect } from 'react';
import { CellSymbol, CellData, Constraint, GameState } from '../types/game.types';
import { validateBoard } from '../utils/gameLogic';
import { puzzles } from '../utils/puzzleData';

// Initialize a 6x6 empty board
const createEmptyBoard = (): CellData[][] => {
  return Array(6).fill(null).map(() => 
    Array(6).fill(null).map(() => ({ 
      symbol: CellSymbol.EMPTY, 
      isFixed: false 
    }))
  );
};

// Load completed levels from localStorage
const loadCompletedLevels = (): number[] => {
  const saved = localStorage.getItem('tangoCompletedLevels');
  return saved ? JSON.parse(saved) : [];
};

// Save completed levels to localStorage
const saveCompletedLevels = (levels: number[]) => {
  localStorage.setItem('tangoCompletedLevels', JSON.stringify(levels));
};

// Initialize a puzzle with fixed cells
const initializePuzzle = (levelId: number): GameState => {
  const board = createEmptyBoard();
  
  // Find the selected puzzle
  const selectedPuzzle = puzzles.find(puzzle => puzzle.id === levelId) || puzzles[0];
  
  // Set fixed cells
  selectedPuzzle.fixedCells.forEach(cell => {
    board[cell.row][cell.col] = {
      symbol: cell.symbol,
      isFixed: true
    };
  });
  
  return {
    board,
    constraints: selectedPuzzle.constraints,
    history: [JSON.parse(JSON.stringify(board))],
    historyIndex: 0,
    isSolved: false,
    currentLevelId: selectedPuzzle.id
  };
};

export const useGameState = () => {
  const [completedLevels, setCompletedLevels] = useState<number[]>(loadCompletedLevels);
  
  const [gameState, setGameState] = useState<GameState & { currentLevelId: number }>(
    () => initializePuzzle(1) // Start with the first level
  );
  
  // When a puzzle is solved, mark it as completed
  useEffect(() => {
    if (gameState.isSolved && !completedLevels.includes(gameState.currentLevelId)) {
      const newCompletedLevels = [...completedLevels, gameState.currentLevelId];
      setCompletedLevels(newCompletedLevels);
      saveCompletedLevels(newCompletedLevels);
    }
  }, [gameState.isSolved, gameState.currentLevelId, completedLevels]);
  
  // Toggle cell between empty, sun, and moon
  const toggleCell = useCallback((row: number, col: number) => {
    setGameState(prevState => {
      // Don't modify fixed cells
      if (prevState.board[row][col].isFixed) return prevState;
      
      // Create a deep copy of the board
      const newBoard = JSON.parse(JSON.stringify(prevState.board));
      
      // Toggle the cell symbol in a 3-state cycle: empty -> sun -> moon -> empty
      const currentSymbol = newBoard[row][col].symbol;
      
      if (currentSymbol === CellSymbol.EMPTY) {
        newBoard[row][col].symbol = CellSymbol.SUN;
      } else if (currentSymbol === CellSymbol.SUN) {
        newBoard[row][col].symbol = CellSymbol.MOON;
      } else { // It's a moon, cycle back to empty
        newBoard[row][col].symbol = CellSymbol.EMPTY;
      }
      
      // Remove previous error flags
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          newBoard[r][c].hasError = false;
        }
      }
      
      // Validate the board
      const { isValid, errorCells } = validateBoard(newBoard, prevState.constraints);
      
      // Check if board is filled and valid (solved)
      const isFilled = !newBoard.some((row: any[]) => 
        row.some(cell => cell.symbol === CellSymbol.EMPTY)
      );
      const isSolved = isValid && isFilled;
      
      // Truncate history if we've gone back in time and made a new move
      const newHistory = prevState.history.slice(0, prevState.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newBoard)));
      
      // Return initial state update without error markers
      return {
        ...prevState,
        board: newBoard,
        history: newHistory,
        historyIndex: prevState.historyIndex + 1,
        isSolved
      };
    });
    
    // Set a timeout to add error markers after 2 seconds
    setTimeout(() => {
      setGameState(prevState => {
        // Create a deep copy of the current board
        const newBoard = JSON.parse(JSON.stringify(prevState.board));
        
        // Validate the board again
        const { errorCells } = validateBoard(newBoard, prevState.constraints);
        
        // Mark cells with errors
        errorCells.forEach(({row, col}: {row: number, col: number}) => {
          newBoard[row][col].hasError = true;
        });
        
        return {
          ...prevState,
          board: newBoard
        };
      });
    }, 2000); // 2000 milliseconds = 2 seconds
  }, []);
  
  // Undo the last move
  const undoMove = useCallback(() => {
    setGameState(prevState => {
      if (prevState.historyIndex <= 0) return prevState;
      
      const newBoard = JSON.parse(JSON.stringify(prevState.history[prevState.historyIndex - 1]));
      
      // Remove all error flags when undoing
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          newBoard[r][c].hasError = false;
        }
      }
      
      return {
        ...prevState,
        board: newBoard,
        historyIndex: prevState.historyIndex - 1,
        isSolved: false
      };
    });
  }, []);
  
  // Get a hint
  const getHint = useCallback(() => {
    setGameState(prevState => {
      // Create a copy of the board
      const newBoard = JSON.parse(JSON.stringify(prevState.board));
      
      // Find an empty cell
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
          if (newBoard[row][col].symbol === CellSymbol.EMPTY) {
            // Try sun first
            newBoard[row][col].symbol = CellSymbol.SUN;
            let { isValid } = validateBoard(newBoard, prevState.constraints);
            
            // If sun causes errors, try moon
            if (!isValid) {
              newBoard[row][col].symbol = CellSymbol.MOON;
            }
            
            // Add to history
            const newHistory = [...prevState.history];
            newHistory.push(JSON.parse(JSON.stringify(newBoard)));
            
            return {
              ...prevState,
              board: newBoard,
              history: newHistory,
              historyIndex: prevState.historyIndex + 1
            };
          }
        }
      }
      
      // If no empty cells found, just return current state
      return prevState;
    });
  }, []);
  
  // Change the current level
  const changeLevel = useCallback((levelId: number) => {
    setGameState(initializePuzzle(levelId));
  }, []);
  
  // Reset the current level
  const resetGame = useCallback(() => {
    setGameState(prevState => initializePuzzle(prevState.currentLevelId));
  }, []);
  
  return {
    gameState,
    completedLevels,
    toggleCell,
    undoMove,
    getHint,
    resetGame,
    changeLevel
  };
};