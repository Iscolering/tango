import { CellSymbol, ConstraintType, Constraint } from '../types/game.types';
import { hasUniqueSolution } from './puzzleSolver';

// Type for a complete puzzle solution
type SolutionGrid = CellSymbol[][];

// Type for a generated puzzle
export type GeneratedPuzzle = {
  fixedCells: {
    row: number;
    col: number;
    symbol: CellSymbol;
  }[];
  constraints: Constraint[];
  solution: SolutionGrid; // Keep the solution for verification
};

// Constants
const GRID_SIZE = 6;
const TARGET_SYMBOLS_PER_ROW = 3;

// Generate a valid solution grid
function generateSolutionGrid(): SolutionGrid {
  // Create a basic alternating pattern as a starting point
  const grid: SolutionGrid = Array(GRID_SIZE).fill(null).map((_, rowIndex) => 
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

// Check if a solution is valid
function isValidSolution(grid: SolutionGrid): boolean {
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

// Generate constraints based on the solution
function generateConstraints(grid: SolutionGrid, count: number = 15): Constraint[] {
  const constraints: Constraint[] = [];
  const usedCells = new Set<string>();
  
  // Helper function to check if a cell is already used in constraints
  const isCellUsed = (row: number, col: number) => usedCells.has(`${row},${col}`);
  
  // Helper function to add a cell to used cells
  const markCellAsUsed = (row: number, col: number) => {
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
function generateFixedCells(grid: SolutionGrid, count: number = 6): { row: number; col: number; symbol: CellSymbol; }[] {
  const fixedCells: { row: number; col: number; symbol: CellSymbol; }[] = [];
  const usedCells = new Set<string>();
  
  // Helper function to check if a cell is already used
  const isCellUsed = (row: number, col: number) => usedCells.has(`${row},${col}`);
  
  // Helper function to add a cell to used cells
  const markCellAsUsed = (row: number, col: number) => {
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

// Main function to generate a complete puzzle
export function generatePuzzle(
  fixedCellCount: number = 6, 
  constraintCount: number = 14
): GeneratedPuzzle {
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
export function generateUniquePuzzles(
  count: number,
  fixedCellCount: number = 6,
  constraintCount: number = 14
): GeneratedPuzzle[] {
  const uniquePuzzles: GeneratedPuzzle[] = [];
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