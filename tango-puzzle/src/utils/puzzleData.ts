import { CellSymbol, ConstraintType } from '../types/game.types';

// Import the generated puzzles
import generatedPuzzles from '../data/puzzles.json';

// Define a type for our puzzle data
export type PuzzleData = {
  id: number;
  name: string;
  constraints: {
    row1: number;
    col1: number;
    row2: number;
    col2: number;
    type: ConstraintType;
  }[];
  fixedCells: {
    row: number;
    col: number;
    symbol: CellSymbol;
  }[];
};

// Convert the imported JSON to the correct type
export const puzzles: PuzzleData[] = generatedPuzzles.map(puzzle => ({
  ...puzzle,
  // Ensure the constraints have the correct type
  constraints: puzzle.constraints.map(constraint => ({
    ...constraint,
    type: constraint.type as ConstraintType
  })),
  // Ensure the fixed cells have the correct symbol type
  fixedCells: puzzle.fixedCells.map(cell => ({
    ...cell,
    symbol: cell.symbol as CellSymbol
  }))
}));

// Add fallback puzzles in case the generated ones aren't loaded
if (puzzles.length === 0) {
  puzzles.push({
    id: 1,
    name: "Level 1",
    constraints: [
      { row1: 0, col1: 0, row2: 0, col2: 1, type: ConstraintType.OPPOSITE },
      { row1: 0, col1: 2, row2: 0, col2: 3, type: ConstraintType.OPPOSITE },
      { row1: 1, col1: 1, row2: 1, col2: 2, type: ConstraintType.OPPOSITE },
      { row1: 1, col1: 4, row2: 1, col2: 5, type: ConstraintType.OPPOSITE },
      { row1: 2, col1: 0, row2: 2, col2: 1, type: ConstraintType.OPPOSITE },
      { row1: 3, col1: 2, row2: 3, col2: 3, type: ConstraintType.OPPOSITE },
      { row1: 4, col1: 1, row2: 4, col2: 2, type: ConstraintType.OPPOSITE },
      { row1: 4, col1: 3, row2: 4, col2: 4, type: ConstraintType.OPPOSITE },
      { row1: 5, col1: 0, row2: 5, col2: 1, type: ConstraintType.OPPOSITE },
      { row1: 0, col1: 0, row2: 1, col2: 0, type: ConstraintType.OPPOSITE },
      { row1: 1, col1: 3, row2: 2, col2: 3, type: ConstraintType.OPPOSITE },
      { row1: 2, col1: 5, row2: 3, col2: 5, type: ConstraintType.OPPOSITE },
      { row1: 3, col1: 2, row2: 4, col2: 2, type: ConstraintType.OPPOSITE },
      { row1: 4, col1: 4, row2: 5, col2: 4, type: ConstraintType.OPPOSITE },
    ],
    fixedCells: [
      { row: 0, col: 0, symbol: CellSymbol.SUN },
      { row: 0, col: 5, symbol: CellSymbol.MOON },
      { row: 1, col: 3, symbol: CellSymbol.SUN },
      { row: 2, col: 2, symbol: CellSymbol.SUN },
      { row: 2, col: 4, symbol: CellSymbol.SUN },
      { row: 3, col: 1, symbol: CellSymbol.SUN },
      { row: 4, col: 0, symbol: CellSymbol.SUN },
      { row: 5, col: 3, symbol: CellSymbol.SUN },
      { row: 5, col: 5, symbol: CellSymbol.SUN }
    ]
  });
}