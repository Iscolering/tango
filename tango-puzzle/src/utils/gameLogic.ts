import { CellData, CellSymbol, Constraint, ConstraintType } from '../types/game.types';

type ValidationResult = {
  isValid: boolean;
  errorCells: { row: number; col: number }[];
};

export const validateBoard = (
  board: CellData[][],
  constraints: Constraint[]
): ValidationResult => {
  const errorCells: { row: number; col: number }[] = [];
  
  // Check for adjacent same symbols (no more than 2)
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      // Skip empty cells
      if (board[row][col].symbol === CellSymbol.EMPTY) continue;
      
      // Check horizontal triplets
      if (col < 4) {
        const current = board[row][col].symbol;
        const next = board[row][col + 1].symbol;
        const nextNext = board[row][col + 2].symbol;
        
        if (current !== CellSymbol.EMPTY && 
            next !== CellSymbol.EMPTY && 
            nextNext !== CellSymbol.EMPTY &&
            current === next && next === nextNext) {
          errorCells.push({ row, col });
          errorCells.push({ row, col: col + 1 });
          errorCells.push({ row, col: col + 2 });
        }
      }
      
      // Check vertical triplets
      if (row < 4) {
        const current = board[row][col].symbol;
        const next = board[row + 1][col].symbol;
        const nextNext = board[row + 2][col].symbol;
        
        if (current !== CellSymbol.EMPTY && 
            next !== CellSymbol.EMPTY && 
            nextNext !== CellSymbol.EMPTY &&
            current === next && next === nextNext) {
          errorCells.push({ row, col });
          errorCells.push({ row: row + 1, col });
          errorCells.push({ row: row + 2, col });
        }
      }
    }
  }
  
  // Check rows and columns for equal numbers of suns and moons
  for (let i = 0; i < 6; i++) {
    // Check if row is complete (no empty cells)
    const isRowComplete = !board[i].some(cell => cell.symbol === CellSymbol.EMPTY);
    
    if (isRowComplete) {
      const sunCount = board[i].filter(cell => cell.symbol === CellSymbol.SUN).length;
      const moonCount = board[i].filter(cell => cell.symbol === CellSymbol.MOON).length;
      
      if (sunCount !== 3 || moonCount !== 3) {
        // Mark all cells in this row as errors
        for (let col = 0; col < 6; col++) {
          errorCells.push({ row: i, col });
        }
      }
    }
    
    // Check if column is complete
    const isColComplete = !board.some(row => row[i].symbol === CellSymbol.EMPTY);
    
    if (isColComplete) {
      const sunCount = board.filter(row => row[i].symbol === CellSymbol.SUN).length;
      const moonCount = board.filter(row => row[i].symbol === CellSymbol.MOON).length;
      
      if (sunCount !== 3 || moonCount !== 3) {
        // Mark all cells in this column as errors
        for (let row = 0; row < 6; row++) {
          errorCells.push({ row, col: i });
        }
      }
    }
  }
  
  // Check constraints (= and × symbols)
  constraints.forEach(constraint => {
    const cell1 = board[constraint.row1][constraint.col1];
    const cell2 = board[constraint.row2][constraint.col2];
    
    // Skip if either cell is empty
    if (cell1.symbol === CellSymbol.EMPTY || cell2.symbol === CellSymbol.EMPTY) {
      return;
    }
    
    if (constraint.type === ConstraintType.EQUAL && cell1.symbol !== cell2.symbol) {
      errorCells.push({ row: constraint.row1, col: constraint.col1 });
      errorCells.push({ row: constraint.row2, col: constraint.col2 });
    }
    
    if (constraint.type === ConstraintType.OPPOSITE && cell1.symbol === cell2.symbol) {
      errorCells.push({ row: constraint.row1, col: constraint.col1 });
      errorCells.push({ row: constraint.row2, col: constraint.col2 });
    }
  });
  
  // Remove duplicate error cells
  const uniqueErrorCells = errorCells.filter(
    (cell, index, self) =>
      index === self.findIndex(c => c.row === cell.row && c.col === cell.col)
  );
  
  return {
    isValid: uniqueErrorCells.length === 0,
    errorCells: uniqueErrorCells
  };
};