import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name correctly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define enums and types for JavaScript
const CellSymbol = {
  EMPTY: 'empty',
  SUN: 'sun',
  MOON: 'moon'
};

const ConstraintType = {
  EQUAL: 'equal',
  OPPOSITE: 'opposite'
};

// Constants
const GRID_SIZE = 6;
const TARGET_SYMBOLS_PER_ROW = 3;
const SYMBOLS_PER_ROW = 3;

// Check if a solution is valid
function isValidSolution(grid) {
  // Check row counts
  for (let row = 0; row < GRID_SIZE; row++) {
    const sunCount = grid[row].filter(cell => cell === CellSymbol.SUN).length;
    if (sunCount !== TARGET_SYMBOLS_PER_ROW) return false;
  }
  
  // Check column counts
  for (let col = 0; col < GRID_SIZE; col++) {
    let sunCount = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      if (grid[row][col] === CellSymbol.SUN) sunCount++;
    }
    if (sunCount !== TARGET_SYMBOLS_PER_ROW) return false;
  }
  
  // Check for triplets horizontally
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 2; col++) {
      if (grid[row][col] === grid[row][col+1] && 
          grid[row][col] === grid[row][col+2]) {
        return false;
      }
    }
  }
  
  // Check for triplets vertically
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE - 2; row++) {
      if (grid[row][col] === grid[row+1][col] && 
          grid[row][col] === grid[row+2][col]) {
        return false;
      }
    }
  }
  
  return true;
}

// Generate a valid solution grid
function generateSolutionGrid() {
  // Create a basic alternating pattern as a starting point
  const grid = Array(GRID_SIZE).fill(null).map((_, rowIndex) => 
    Array(GRID_SIZE).fill(null).map((_, colIndex) => 
      (rowIndex + colIndex) % 2 === 0 ? CellSymbol.SUN : CellSymbol.MOON
    )
  );
  
  // Perform random swaps to create variety while maintaining row/column balance
  for (let i = 0; i < 20; i++) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    // Swap two cells in the same row
    const col1 = Math.floor(Math.random() * GRID_SIZE);
    let col2 = Math.floor(Math.random() * GRID_SIZE);
    // Make sure col2 is different from col1
    while (col2 === col1) {
      col2 = Math.floor(Math.random() * GRID_SIZE);
    }
    
    // Swap the cells
    const temp = grid[row][col1];
    grid[row][col1] = grid[row][col2];
    grid[row][col2] = temp;
  }
  
  // Perform more swaps to ensure we avoid triplets of same symbol
  for (let i = 0; i < 20; i++) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    
    // Check for horizontal triplets
    if (col > 0 && col < GRID_SIZE - 1) {
      if (grid[row][col-1] === grid[row][col] && grid[row][col] === grid[row][col+1]) {
        // We have a triplet, swap this cell
        grid[row][col] = grid[row][col] === CellSymbol.SUN ? CellSymbol.MOON : CellSymbol.SUN;
      }
    }
    
    // Check for vertical triplets
    if (row > 0 && row < GRID_SIZE - 1) {
      if (grid[row-1][col] === grid[row][col] && grid[row][col] === grid[row+1][col]) {
        // We have a triplet, swap this cell
        grid[row][col] = grid[row][col] === CellSymbol.SUN ? CellSymbol.MOON : CellSymbol.SUN;
      }
    }
  }
  
  // Verify the solution is valid
  if (!isValidSolution(grid)) {
    // If not valid, recursively try again
    return generateSolutionGrid();
  }
  
  return grid;
}

// Generate constraints based on the solution
function generateConstraints(grid, count = 15) {
  const constraints = [];
  const usedCells = new Set();
  
  // Helper function to check if a cell is already used in constraints
  const isCellUsed = (row, col) => usedCells.has(`${row},${col}`);
  
  // Helper function to add a cell to used cells
  const markCellAsUsed = (row, col) => {
    usedCells.add(`${row},${col}`);
  };
  
  // Try to create constraints until we reach the desired count
  let attempts = 0;
  while (constraints.length < count && attempts < 1000) {
    attempts++;
    
    // Choose random cells to create a constraint
    const row1 = Math.floor(Math.random() * GRID_SIZE);
    const col1 = Math.floor(Math.random() * GRID_SIZE);
    
    // Skip if this cell is already used
    if (isCellUsed(row1, col1)) continue;
    
    // Try to create a horizontal constraint
    if (col1 < GRID_SIZE - 1 && !isCellUsed(row1, col1 + 1)) {
      // Check if cells are the same or different
      const type = grid[row1][col1] === grid[row1][col1 + 1] 
        ? ConstraintType.EQUAL 
        : ConstraintType.OPPOSITE;
      
      constraints.push({
        row1, col1,
        row2: row1, col2: col1 + 1,
        type
      });
      
      markCellAsUsed(row1, col1);
      markCellAsUsed(row1, col1 + 1);
      continue;
    }
    
    // Try to create a vertical constraint
    if (row1 < GRID_SIZE - 1 && !isCellUsed(row1 + 1, col1)) {
      // Check if cells are the same or different
      const type = grid[row1][col1] === grid[row1 + 1][col1] 
        ? ConstraintType.EQUAL 
        : ConstraintType.OPPOSITE;
      
      constraints.push({
        row1, col1,
        row2: row1 + 1, col2: col1,
        type
      });
      
      markCellAsUsed(row1, col1);
      markCellAsUsed(row1 + 1, col1);
      continue;
    }
  }
  
  return constraints;
}

// Generate fixed cells (minimal number)
function generateFixedCells(grid, count = 6) {
  const fixedCells = [];
  const usedCells = new Set();
  
  // Helper function to check if a cell is already used
  const isCellUsed = (row, col) => usedCells.has(`${row},${col}`);
  
  // Helper function to add a cell to used cells
  const markCellAsUsed = (row, col) => {
    usedCells.add(`${row},${col}`);
  };
  
  // Try to create constraints until we reach the desired count
  while (fixedCells.length < count) {
    // Choose random cells to make fixed
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    
    // Skip if this cell is already used
    if (isCellUsed(row, col)) continue;
    
    fixedCells.push({
      row,
      col,
      symbol: grid[row][col]
    });
    
    markCellAsUsed(row, col);
  }
  
  return fixedCells;
}

// Initialize a board state from fixed cells
function initializeBoard(puzzle) {
  // Create empty board
  const board = Array(GRID_SIZE).fill(null).map(() => 
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
function hasTriplets(board) {
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
function violatesConstraints(board, constraints) {
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
function checkBalance(cells) {
  const sunCount = cells.filter(c => c === CellSymbol.SUN).length;
  const moonCount = cells.filter(c => c === CellSymbol.MOON).length;
  
  return sunCount <= SYMBOLS_PER_ROW && moonCount <= SYMBOLS_PER_ROW;
}

// Check if a board has balanced rows and columns
function hasBalancedRowsAndColumns(board) {
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
function solve(board, constraints, row = 0, col = 0, solutions = []) {
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
function hasUniqueSolution(puzzle) {
  const board = initializeBoard(puzzle);
  const solutions = [];
  
  solve(board, puzzle.constraints, 0, 0, solutions);
  
  return solutions.length === 1;
}

// Main function to generate a complete puzzle
function generatePuzzle(fixedCellCount = 6, constraintCount = 14) {
  // 1. Generate a valid solution grid
  const solution = generateSolutionGrid();
  
  // 2. Generate constraints based on the solution
  const constraints = generateConstraints(solution, constraintCount);
  
  // 3. Generate fixed cells
  const fixedCells = generateFixedCells(solution, fixedCellCount);
  
  return {
    solution,
    constraints,
    fixedCells
  };
}

// Generate a batch of puzzles with unique solutions
function generateUniquePuzzles(
  count,
  fixedCellCount = 6,
  constraintCount = 14
) {
  const uniquePuzzles = [];
  let attempts = 0;
  
  while (uniquePuzzles.length < count && attempts < count * 10) {
    attempts++;
    const puzzle = generatePuzzle(fixedCellCount, constraintCount);
    
    // Check if the puzzle has a unique solution
    if (hasUniqueSolution({
      fixedCells: puzzle.fixedCells,
      constraints: puzzle.constraints
    })) {
      uniquePuzzles.push(puzzle);
      console.log(`Generated puzzle ${uniquePuzzles.length}/${count}`);
    }
  }
  
  return uniquePuzzles;
}

// Number of puzzles to generate - start with a small number for testing
const PUZZLE_COUNT = 200; // You can increase this once you've tested

// Generate puzzles
console.log(`Generating ${PUZZLE_COUNT} unique puzzles...`);
const puzzles = generateUniquePuzzles(PUZZLE_COUNT, 6, 14);
console.log(`Successfully generated ${puzzles.length} puzzles.`);

// Save puzzles to a JSON file
const puzzlesData = puzzles.map((puzzle, index) => ({
  id: index + 1,
  name: `Level ${index + 1}`,
  constraints: puzzle.constraints,
  fixedCells: puzzle.fixedCells
}));

const outputPath = path.join(__dirname, 'src', 'data', 'puzzles.json');
// Ensure directory exists
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(puzzlesData, null, 2));
console.log(`Puzzles saved to ${outputPath}`);