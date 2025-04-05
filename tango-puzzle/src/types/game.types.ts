// Cell symbols
export enum CellSymbol {
    EMPTY = 'empty',
    SUN = 'sun',
    MOON = 'moon'
  }
  
  // Constraint types
  export enum ConstraintType {
    EQUAL = 'equal',
    OPPOSITE = 'opposite'
  }
  
  // Constraint between two cells
  export type Constraint = {
    row1: number;
    col1: number;
    row2: number;
    col2: number;
    type: ConstraintType;
  };
  
  // Individual cell data
  export type CellData = {
    symbol: CellSymbol;
    isFixed: boolean;
    hasError?: boolean;
  };
  
  // Game state
  export type GameState = {
    board: CellData[][];
    constraints: Constraint[];
    history: CellData[][][];
    historyIndex: number;
    isSolved: boolean;
    currentLevelId: number;
  };