import { CellSymbol, ConstraintType, Constraint } from '../types/game.types';

// Type for a puzzle board state
type BoardState = {
  value: CellSymbol;
  fixed: boolean;
}[][];

// Type for a puzzle to solve
type Puzzle = {
  fixedCells: {
    row: number;
    col: number;
    symbol: CellSymbol;
  }[];
  constraints: Constraint[];
};

// Constants
const GRID_SIZE = 6;
const SYMBOLS_PER_ROW = 3;

// Initialize a board state from fixed cells
function initializeBoard(puzzle: Puzzle): BoardState {
  // Create empty board
  const board: BoardState = Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill(null).map(() => ({
      value: CellSymbol.EMPTY,
      fixed: false
    }))
  );
  
  // Set fixed cells
  for (const cell of puzzle.fixedCells) {
    board[cell.row][cell.col] = {
      value: cell.symbol,
      fixed: true
    };
  }
  
  return board;
}

// Check if a board violates any triplet constraints
function hasTriplets(board: BoardState): boolean {
  // Check for triplets horizontally
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 2; col++) {
      const val1 = board[row][col].value;
      const val2 = board[row][col+1].value;
      const val3 = board[row][col+2].value;
      
      if (val1 !== CellSymbol.EMPTY && val1 === val2 && val2 === val3) {
        return true;
      }
    }
  }
  
  // Check for triplets vertically
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE - 2; row++) {
      const val1 = board[row][col].value;
      const val2 = board[row+1][col].value;
      const val3 = board[row+2][col].value;
      
      if (val1 !== CellSymbol.EMPTY && val1 === val2 && val2 === val3) {
        return true;
      }
    }
  }
  
  return false;
}

// Check if a board violates any constraints
function violatesConstraints(board: BoardState, constraints: Constraint[]): boolean {
  for (const constraint of constraints) {
    const val1 = board[constraint.row1][constraint.col1].value;
    const val2 = board[constraint.row2][constraint.col2].value;
    
    // Skip if either cell is empty
    if (val1 === CellSymbol.EMPTY || val2 === CellSymbol.EMPTY) {
      continue;
    }
    
    if (constraint.type === ConstraintType.EQUAL && val1 !== val2) {
      return true;
    }
    
    if (constraint.type === ConstraintType.OPPOSITE && val1 === val2) {
      return true;
    }
  }
  
  return false;
}

// Check if a row or column is balanced (has equal suns and moons)
function checkBalance(cells: CellSymbol[]): boolean {
  const sunCount = cells.filter(c => c === CellSymbol.SUN).length;
  const moonCount = cells.filter(c => c === CellSymbol.MOON).length;
  
  return sunCount <= SYMBOLS_PER_ROW && moonCount <= SYMBOLS_PER_ROW;
}

// Check if a board has balanced rows and columns
function hasBalancedRowsAndColumns(board: BoardState): boolean {
  // Check rows
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowCells = board[row].map(cell => cell.value);
    if (!checkBalance(rowCells)) {
      return false;
    }
  }
  
  // Check columns
  for (let col = 0; col < GRID_SIZE; col++) {
    const colCells = board.map(row => row[col].value);
    if (!checkBalance(colCells)) {
      return false;
    }
  }
  
  return true;
}

// Try to solve a puzzle using backtracking
function solve(
  board: BoardState, 
  constraints: Constraint[], 
  row: number = 0, 
  col: number = 0,
  solutions: BoardState[] = []
): boolean {
  // If we found multiple solutions, stop searching
  if (solutions.length > 1) {
    return true;
  }
  
  // If we've filled the entire board, check if it's valid
  if (row >= GRID_SIZE) {
    // Create a deep copy of the board
    const solution = JSON.parse(JSON.stringify(board));
    solutions.push(solution);
    return true;
  }
  
  // Move to the next cell
  const nextRow = col === GRID_SIZE - 1 ? row + 1 : row;
  const nextCol = col === GRID_SIZE - 1 ? 0 : col + 1;
  
  // If this cell is fixed, move to the next
  if (board[row][col].fixed) {
    return solve(board, constraints, nextRow, nextCol, solutions);
  }
  
  // Try placing a sun
  board[row][col].value = CellSymbol.SUN;
  
  // Check if it violates any constraints
  if (!hasTriplets(board) && 
      !violatesConstraints(board, constraints) && 
      hasBalancedRowsAndColumns(board)) {
    solve(board, constraints, nextRow, nextCol, solutions);
  }
  
  // Try placing a moon
  board[row][col].value = CellSymbol.MOON;
  
  // Check if it violates any constraints
  if (!hasTriplets(board) && 
      !violatesConstraints(board, constraints) && 
      hasBalancedRowsAndColumns(board)) {
    solve(board, constraints, nextRow, nextCol, solutions);
  }
  
  // Reset cell for backtracking
  board[row][col].value = CellSymbol.EMPTY;
  
  return solutions.length > 0;
}

// Check if a puzzle has a unique solution
export function hasUniqueSolution(puzzle: Puzzle): boolean {
  const board = initializeBoard(puzzle);
  const solutions: BoardState[] = [];
  
  solve(board, puzzle.constraints, 0, 0, solutions);
  
  return solutions.length === 1;
}

// Solve a puzzle and return the solution
export function solvePuzzle(puzzle: Puzzle): CellSymbol[][] | null {
  const board = initializeBoard(puzzle);
  const solutions: BoardState[] = [];
  
  solve(board, puzzle.constraints, 0, 0, solutions);
  
  if (solutions.length === 0) {
    return null;
  }
  
  // Return the first solution
  return solutions[0].map(row => row.map(cell => cell.value));
}